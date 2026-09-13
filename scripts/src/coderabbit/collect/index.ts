import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

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
  RETRIGGER_DELAY_OUTPUT,
  RETRIGGER_PULL_REQUEST_OUTPUT,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { readEntries } from "#src/services/coderabbit/collect/readEntries";
import { readOpenPullRequest } from "#src/services/coderabbit/collect/readOpenPullRequest";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { verifyCandidate } from "#src/services/coderabbit/collect/verifyCandidate";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
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
// This and a run against unchanged state does nothing (docs: infra/review-collector).
const {
  positionals: [pullRequestArgument],
  values: { "dry-run": isDryRun, force: isForced },
} = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { default: false, type: "boolean" }, force: { default: false, type: "boolean" } },
});

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
const mainSha = readSha(`origin/${MAIN_BRANCH}`);
const queueSha = readSha(`origin/${QUEUE_BRANCH}`);
const pushedDevelopSha = readSha(`origin/${DEVELOP_BRANCH}`);
if (!pushedDevelopSha || !queueSha || !mainSha)
  throw new InvalidOperationError(
    Operation.Read,
    "coderabbit",
    `origin/${DEVELOP_BRANCH}, origin/${QUEUE_BRANCH} or origin/${MAIN_BRANCH} is missing`,
  );
let reviewFixesSha = readSha(`origin/${REVIEW_FIXES_BRANCH}`);

// The return stroke: the release pull request just merged, so develop is an ancestor of main and follows it by
// Fast-forward — no slot spent, since no pull request is open. Main advancing on its own (a dependency bump)
// Leaves develop no ancestor, and the porter folds that into the next window instead.
const isDevelopBehindMain =
  pushedDevelopSha !== mainSha &&
  getResult(() => runGit(["merge-base", "--is-ancestor", pushedDevelopSha, mainSha])).match(
    () => true,
    () => false,
  );
if (isDevelopBehindMain) {
  console.info(
    `${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it${isDryRun ? " (dry run: not pushed)" : ""}`,
  );
  if (!isDryRun) runGit(["push", "origin", `${mainSha}:refs/heads/${DEVELOP_BRANCH}`]);
}
const developSha = isDevelopBehindMain ? mainSha : pushedDevelopSha;

const pullRequest = pullRequestArgument ? Number(pullRequestArgument) : readOpenPullRequest()?.number;
if (pullRequest === undefined) {
  console.info(`no open ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request — re-opening one is a human ask`);
  process.exit(0);
}
if (!Number.isSafeInteger(pullRequest) || pullRequest <= 0)
  throw new InvalidOperationError(Operation.Read, "coderabbit", "the pull request argument is not a number");

const reviews = readBotEntries<GitHubReview>(`pulls/${pullRequest.toString()}/reviews`);
const lastReviewedSha = getLastReviewedSha(reviews.map(({ body }) => body));
const frontier = lastReviewedSha ?? runGit(["merge-base", mainSha, developSha]).trim();
const viewerLogin = readViewerLogin();
console.info(`pull request #${pullRequest.toString()} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`);
console.info(`develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nfrontier ${frontier}`);

// Replies first: a run that pushed and died before replying is finished here, by whichever event fires next,
// And it must happen before any exit — the running review is the one that resolves these threads.
replyAnswered(pullRequest, `${frontier}..${developSha}`, viewerLogin, isDryRun);

const issueComments = readEntries(`issues/${pullRequest.toString()}/comments`);
const checkStatus = readCheckStatus(pullRequest);
const gate = getGateDecision({ checkStatus, developSha, lastReviewedSha });
console.info(`gate: ${gate.kind} — ${gate.reason}`);
if (gate.kind === GateDecisionKind.Exit) process.exit(0);
else if (gate.kind === GateDecisionKind.Fail)
  throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
else if (gate.kind === GateDecisionKind.RateLimited) {
  // The bot ran nothing, so the slot is free and the window is measured from the frontier it left alone. What is
  // Owed is the review it skipped, and the limit lifts without announcing it — so the run reads the deadline the
  // Bot published and hands it to the runner's retrigger job, whose review submits the event the cycle already
  // Resumes on. Asking the bot instead, by posting a retrigger to be told the deadline it has already written
  // Down, is the poll this replaces.
  const waitSeconds = Math.ceil(
    Temporal.Duration.from({ milliseconds: getRateLimitWaitMs(issueComments, Date.now()) }).total("seconds"),
  );
  if (!isDryRun) {
    writeJobOutput(RETRIGGER_DELAY_OUTPUT, waitSeconds.toString());
    writeJobOutput(RETRIGGER_PULL_REQUEST_OUTPUT, pullRequest.toString());
  }
  console.info(
    `rate limited — retrigger in ${waitSeconds.toString()}s, the deadline the bot stated${isDryRun ? " (dry run: not scheduled)" : ""}`,
  );
}

// Drain: the open set is what the bot spoke last on and no unported commit answers
const newestReview = reviews.findLast(({ body }) => body);
const unportedCommits = [
  ...(reviewFixesSha ? readAnsweredCommits(`${developSha}..${reviewFixesSha}`) : []),
  ...readAnsweredCommits(`${developSha}..${queueSha}`),
];
const answeredIds = new Set(unportedCommits.flatMap(({ answers }) => answers));
const drainedReviewIds = new Set(
  [...unportedCommits, ...readAnsweredCommits(`${frontier}..${developSha}`)].flatMap(({ drains }) => drains),
);
const openThreads = getOpenFindings(readUnresolvedThreads(pullRequest), answeredIds);
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

const drainLimitResetMs = readDrainLimitResetMs(issueComments, viewerLogin);
if (newestReview && (openThreads.length > 0 || openBodyReviewId !== undefined))
  if (isDryRun) console.info("would drain — a dry run runs no Claude session");
  // Claude Code's own limit, read off the marker the run that hit it wrote. Nothing announces it lifting and
  // Every queue push fires a cycle, so without this each one downloads Claude Code to be refused again.
  else if (drainLimitResetMs !== undefined && drainLimitResetMs > Date.now()) {
    console.info(
      `the drain is limited until ${new Date(drainLimitResetMs).toISOString()} — the findings stay open, so nothing ports ahead of them`,
    );
    process.exit(0);
  } else {
    const feedback = execFileSync("pnpm", ["ai:coderabbit:feedback", pullRequest.toString()], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    const drain = drainFindings({
      developSha,
      feedback,
      issueComments,
      newestReviewId: newestReview.id,
      openThreads,
      pullRequest,
      reviewFixesSha,
      reviewId: openBodyReviewId,
      viewerLogin,
    });
    // The open set is untouched, so porting now would put a window ahead of findings that must lead it
    if (drain.isLimited) process.exit(0);
    reviewFixesSha = drain.reviewFixesSha;
  }

// Port into the tree the run owns — a throwaway worktree for a dry run, this checkout otherwise
const cwd = isDryRun ? mkdtempSync(join(tmpdir(), DRY_RUN_WORKTREE_PREFIX)) : REPOSITORY_ROOT;
if (isDryRun) runGit(["worktree", "add", "--detach", cwd, developSha]);
const port = portWindow({ cwd, developSha, frontierSha: frontier, queueSha, reviewFixesSha });
console.info(
  `window: ${port.fixCount.toString()} fix commits + ${port.queueShas.length.toString()} queue commits = ${port.fileCount.toString()} files${port.heldSha ? `, held from ${port.heldSha}` : ""}${port.isMainMerged ? ", main folded in" : ""}${port.isFastForward ? ", fast-forward" : ""}`,
);
const isReady = getIsReady({
  fileCount: port.fileCount,
  fixCount: port.fixCount,
  isForced,
  queueCommitCount: port.queueShas.length,
});
if (!isReady) {
  // A held first commit is not an under-filled queue — the window is full of carry-over nothing has reviewed yet
  if (port.queueShas.length === 0 && port.heldSha) console.info("held — no owed commit fits this window");
  else if (port.fixCount > 0) console.info("parked — fixes wait for the queue");
  else console.info("waiting — the queue is under the fill target");
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
// Fail closed: an unreadable status is not a free slot. `gh` answering nothing is indistinguishable from a
// Review that started a second ago, and the next run re-reads it for the cost of one skipped window.
const finalCheckStatus = readCheckStatus(pullRequest);
if (finalCheckStatus === undefined || finalCheckStatus.bucket === PENDING_BUCKET) {
  console.info("a review started during the run, or its status could not be read — nothing pushed");
  process.exit(0);
}
const target = port.isFastForward ? (port.queueShas.at(-1) ?? developSha) : runGit(["rev-parse", "HEAD"], cwd).trim();
runGit(["push", "origin", `${target}:refs/heads/${DEVELOP_BRANCH}`], cwd);
console.info(`pushed ${target} to ${DEVELOP_BRANCH}`);

runGit(["fetch", "origin", DEVELOP_BRANCH]);
replyAnswered(pullRequest, `${developSha}..${target}`, viewerLogin, false);
