import type { GitHubReview } from "#src/models/coderabbit/GitHubReview";

import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkHasMarkerComment, getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import {
  DEVELOP_BRANCH,
  DRAINS_MARKER,
  DRY_RUN_WORKTREE_PREFIX,
  GREEN_CUT_RETRY_LIMIT,
  MAIN_BRANCH,
  PENDING_BUCKET,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { checkIsAlreadyReviewed } from "#src/services/coderabbit/collect/checkIsAlreadyReviewed";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readEntries } from "#src/services/coderabbit/collect/readEntries";
import { readOpenPullRequest } from "#src/services/coderabbit/collect/readOpenPullRequest";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { verifyCandidate } from "#src/services/coderabbit/collect/verifyCandidate";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { runProbe } from "#src/services/coderabbit/probe/runProbe";
import { readBotEntries } from "#src/services/coderabbit/readBotEntries";
import { runGit } from "#src/services/coderabbit/runGit";
import { getLastReviewedSha } from "#src/services/coderabbit/window/getLastReviewedSha";
import { REPOSITORY_ROOT } from "#src/services/constants";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

// One pass: read, reply, gate, drain, port, push, reply. Every input is a remote fact and every write is
// Either the single fast-forward push or guarded by a predicate a later run re-evaluates, so any event may run
// This and a run against unchanged state does nothing (docs: proposals/infra/review-collector).
const {
  positionals: [pullRequestArgument],
  values: { "dry-run": isDryRun, force: isForced },
} = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { default: false, type: "boolean" }, force: { default: false, type: "boolean" } },
});

const pullRequest = pullRequestArgument ? Number(pullRequestArgument) : readOpenPullRequest()?.number;
if (pullRequest === undefined) {
  console.info(`no open ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request — re-opening one is a human ask`);
  process.exit(0);
}
if (!Number.isSafeInteger(pullRequest) || pullRequest <= 0)
  throw new InvalidOperationError(Operation.Read, "coderabbit", "the pull request argument is not a number");

const dirtyPaths = getNonEmptyLines(runGit(["status", "--porcelain", "-uall"]));
if (!isDryRun && dirtyPaths.length > 0)
  throw new InvalidOperationError(
    Operation.Update,
    "coderabbit",
    `the working tree is dirty — the collector owns it:\n${dirtyPaths.join("\n")}`,
  );

runGit(["fetch", "--prune", "origin"]);
const readSha = (ref: string): string | undefined =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", ref]).trim()).unwrapOr(undefined);
const developSha = readSha(`origin/${DEVELOP_BRANCH}`);
const queueSha = readSha(`origin/${QUEUE_BRANCH}`);
if (!developSha || !queueSha)
  throw new InvalidOperationError(
    Operation.Read,
    "coderabbit",
    `origin/${DEVELOP_BRANCH} or origin/${QUEUE_BRANCH} is missing`,
  );
let reviewFixesSha = readSha(`origin/${REVIEW_FIXES_BRANCH}`);

const reviews = readBotEntries<GitHubReview>(`pulls/${pullRequest.toString()}/reviews`);
const lastReviewedSha = getLastReviewedSha(reviews.map(({ body }) => body));
const frontier = lastReviewedSha ?? runGit(["merge-base", `origin/${MAIN_BRANCH}`, developSha]).trim();
const viewerLogin = readViewerLogin();
console.info(`pull request #${pullRequest.toString()} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`);
console.info(`develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nfrontier ${frontier}`);

// Replies first: a run that pushed and died before replying is finished here, by whichever event fires next,
// And it must happen before any exit — the running review is the one that resolves these threads.
replyAnswered(pullRequest, `${frontier}..${developSha}`, viewerLogin, isDryRun);

const checkStatus = readCheckStatus(pullRequest);
const gate = getGateDecision({ checkStatus, developSha, lastReviewedSha });
console.info(`gate: ${gate.kind} — ${gate.reason}`);
if (gate.kind === GateDecisionKind.Exit) process.exit(0);
else if (gate.kind === GateDecisionKind.Fail)
  throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
else if (gate.kind === GateDecisionKind.Probe) {
  if (isDryRun) {
    console.info("would probe — a dry run posts nothing");
    process.exit(0);
  }
  const reply = await runProbe(pullRequest);
  if (!checkIsAlreadyReviewed(reply)) {
    console.info("a review started — its completion re-fires the collector");
    process.exit(0);
  }
  console.info("already reviewed — the checkpoint covers the head");
}

// Drain: the open set is what the bot spoke last on and no unported commit answers
const newestReview = reviews.findLast(({ body }) => body);
const answeredIds = new Set(
  [
    ...(reviewFixesSha ? readAnsweredCommits(`${developSha}..${reviewFixesSha}`) : []),
    ...readAnsweredCommits(`${developSha}..${queueSha}`),
  ].flatMap(({ answers }) => answers),
);
const drainedReviewIds = new Set(
  [
    ...(reviewFixesSha ? readAnsweredCommits(`${developSha}..${reviewFixesSha}`) : []),
    ...readAnsweredCommits(`${developSha}..${queueSha}`),
    ...readAnsweredCommits(`${frontier}..${developSha}`),
  ].flatMap(({ drains }) => drains),
);
const openThreads = getOpenFindings(readUnresolvedThreads(pullRequest), answeredIds);
const issueComments = readEntries(`issues/${pullRequest.toString()}/comments`);
// A review states its own nitpick and outside-diff counts, so a review with none of either owes no body drain
const statedCounts = newestReview ? getStatedCounts(newestReview.body) : undefined;
const openBodyReviewId =
  newestReview &&
  statedCounts &&
  statedCounts.nitpick + statedCounts.outsideDiff > 0 &&
  !drainedReviewIds.has(newestReview.id) &&
  !checkHasMarkerComment(issueComments, viewerLogin, getMarker(DRAINS_MARKER, newestReview.id))
    ? newestReview.id
    : undefined;
console.info(
  `open findings: ${openThreads.length.toString()} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
);

if (newestReview && (openThreads.length > 0 || openBodyReviewId !== undefined))
  if (isDryRun) console.info("would drain — a dry run runs no Claude session");
  else {
    const feedback = execFileSync("pnpm", ["ai:coderabbit:feedback", pullRequest.toString()], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    reviewFixesSha = drainFindings({
      developSha,
      feedback,
      newestReviewId: newestReview.id,
      openThreads,
      pullRequest,
      reviewFixesSha,
      reviewId: openBodyReviewId,
      viewerLogin,
    });
  }

// Port into the tree the run owns — a throwaway worktree for a dry run, this checkout otherwise
const cwd = isDryRun ? mkdtempSync(join(tmpdir(), DRY_RUN_WORKTREE_PREFIX)) : REPOSITORY_ROOT;
if (isDryRun) runGit(["worktree", "add", "--detach", cwd, developSha]);
const port = portWindow({ cwd, developSha, queueSha, reviewFixesSha });
console.info(
  `window: ${port.fixCount.toString()} fix commits + ${port.queueShas.length.toString()} queue commits = ${port.fileCount.toString()} files${port.heldSha ? `, held from ${port.heldSha}` : ""}${port.isFastForward ? ", fast-forward" : ""}`,
);
const isReady = getIsReady({
  fileCount: port.fileCount,
  fixCount: port.fixCount,
  isForced,
  queueCommitCount: port.queueShas.length,
});
if (!isReady) {
  console.info(
    port.fixCount > 0 ? "parked — fixes wait for the queue" : "waiting — the queue is under the fill target",
  );
  if (isDryRun) runGit(["worktree", "remove", "--force", cwd]);
  process.exit(0);
}
if (isDryRun) {
  console.info(
    `would push ${port.isFastForward ? (port.queueShas.at(-1) ?? developSha) : "the cherry-picked candidate"} to ${DEVELOP_BRANCH}`,
  );
  runGit(["worktree", "remove", "--force", cwd]);
  process.exit(0);
}

// The cut is green on its own, or it shrinks until it is
let retries = GREEN_CUT_RETRY_LIMIT;
while (!verifyCandidate(cwd)) {
  if (port.queueShas.length === 0)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      "the fixes alone are red — the drain touched more than its findings",
    );
  else if (retries === 0)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `no green cut within the retry limit — held from ${port.queueShas[0] ?? ""}`,
    );
  runGit(["reset", "--hard", "HEAD~1"], cwd);
  port.queueShas.pop();
  retries -= 1;
  if (port.queueShas.length === 0 && port.fixCount === 0) {
    console.info("nothing green to push");
    process.exit(0);
  }
}

// Compare-and-swap: a fresh fetch, the develop head still the one measured against, no review started meanwhile
runGit(["fetch", "origin", DEVELOP_BRANCH]);
if (readSha(`origin/${DEVELOP_BRANCH}`) !== developSha) {
  console.info(`${DEVELOP_BRANCH} moved during the run — nothing pushed, the next run re-measures`);
  process.exit(0);
}
if (readCheckStatus(pullRequest)?.bucket === PENDING_BUCKET) {
  console.info("a review started during the run — nothing pushed");
  process.exit(0);
}
const target = port.isFastForward ? (port.queueShas.at(-1) ?? developSha) : runGit(["rev-parse", "HEAD"], cwd).trim();
runGit(["push", "origin", `${target}:refs/heads/${DEVELOP_BRANCH}`], cwd);
console.info(`pushed ${target} to ${DEVELOP_BRANCH}`);

runGit(["fetch", "origin", DEVELOP_BRANCH]);
replyAnswered(pullRequest, `${developSha}..${target}`, viewerLogin, false);
