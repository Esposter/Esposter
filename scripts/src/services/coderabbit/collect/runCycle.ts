import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { cutCandidate } from "#src/services/coderabbit/collect/cutCandidate";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { readOpenPullRequest } from "#src/services/coderabbit/collect/readOpenPullRequest";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getFileCount } from "#src/services/coderabbit/window/getFileCount";
import { getLastReviewedSha } from "#src/services/coderabbit/window/getLastReviewedSha";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const readSha = (ref: string): string | undefined =>
  getResult(() => runGit(["rev-parse", "--verify", "--quiet", ref]).trim()).unwrapOr(undefined);

// One pass: read, reply, gate, drain, port, push, reply. Every input is a remote fact and every write is either
// The single fast-forward push or guarded by a predicate a later run re-evaluates, so any event may run this and
// A run against unchanged state does nothing (docs: infra/review-collector).
//
// The pass returns its verdict rather than exiting, which is what makes a dry run one mode of the same code path
// Instead of a second one: it reports the irreversible act it stopped in front of as the outcome it would have
// Reached. The entry point owns everything a returned value cannot — the arguments, the worktree, the job output.
export const runCycle = async ({
  cwd,
  isDryRun,
  isForced,
  pullRequest: namedPullRequest,
}: CycleInput): Promise<CycleOutcome> => {
  // Whatever retrigger the bot's stated deadline owes is scheduled regardless of what the run goes on to do, so
  // Every outcome from the gate down carries it
  let retriggerDelaySeconds: number | undefined;
  const getOutcome = (kind: CycleOutcomeKind, reason: string, targetSha?: string): CycleOutcome => ({
    kind,
    reason,
    retriggerDelaySeconds,
    targetSha,
  });

  runGit(["fetch", "--prune", "origin"]);
  const mainSha = readSha(`origin/${MAIN_BRANCH}`);
  const queueSha = readSha(`origin/${QUEUE_BRANCH}`);
  const developSha = readSha(`origin/${DEVELOP_BRANCH}`);
  if (!developSha || !queueSha || !mainSha)
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `origin/${DEVELOP_BRANCH}, origin/${QUEUE_BRANCH} or origin/${MAIN_BRANCH} is missing`,
    );
  let reviewFixesSha = readSha(`origin/${REVIEW_FIXES_BRANCH}`);

  // The return stroke: the release pull request just merged, so develop is an ancestor of main and follows it by
  // Fast-forward — no slot spent, since no pull request is open. Main advancing on its own (a dependency bump)
  // Leaves develop no ancestor, and the porter folds that into the next window instead. The push is this run's
  // One irreversible act: with develop and main now agreeing the express lane is open, and taking it here would
  // Make two pushes of one run. It waits for the next event, and a mechanical commit is never the urgent one.
  const isDevelopBehindMain =
    developSha !== mainSha &&
    getResult(() => runGit(["merge-base", "--is-ancestor", developSha, mainSha])).match(
      () => true,
      () => false,
    );
  if (isDevelopBehindMain) {
    console.info(`${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it`);
    if (!pushBranch({ branch: DEVELOP_BRANCH, expectedSha: developSha, isDryRun, sha: mainSha }))
      return getMovedOutcome(DEVELOP_BRANCH);
    return getOutcome(
      CycleOutcomeKind.FastForwarded,
      `${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the next event measures against it`,
      mainSha,
    );
  }

  // The express lane, before the pull request is even looked up: a mechanical commit reaches `main` directly and
  // The return stroke carries it to `develop` on the next run
  const expressed = runExpressLane({ cwd, developSha, isDryRun, mainSha, queueSha });
  if (expressed) return expressed;

  const pullRequest = namedPullRequest ?? readOpenPullRequest()?.number;
  if (pullRequest === undefined)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `no open ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request — re-opening one is a human ask`,
    );

  const reviews = readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`);
  const lastReviewedSha = getLastReviewedSha(reviews.map(({ body }) => body));
  const frontier = lastReviewedSha ?? runGit(["merge-base", mainSha, developSha]).trim();
  const viewerLogin = readViewerLogin();
  console.info(`pull request #${pullRequest} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`);
  console.info(`develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nfrontier ${frontier}`);

  // Replies first: a run that pushed and died before replying is finished here, by whichever event fires next,
  // And it must happen before any exit — the running review is the one that resolves these threads.
  replyAnswered(pullRequest, `${frontier}..${developSha}`, viewerLogin, isDryRun);

  const issueComments = readEntries(`issues/${pullRequest}/comments`);
  const gate = getGateDecision({ checkStatus: readCheckStatus(pullRequest), developSha, lastReviewedSha });
  console.info(`gate: ${gate.kind} — ${gate.reason}`);
  if (gate.kind === GateDecisionKind.Exit) return getOutcome(CycleOutcomeKind.Idle, gate.reason);
  else if (gate.kind === GateDecisionKind.Fail)
    throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
  // The bot ran nothing, so the slot is free and the window is measured from the frontier it left alone. What is
  // Owed is the review it skipped — answered once the port has said whether anything can still be added to the
  // Range, because a range that will grow is not one to spend an hour reading yet.
  const isRateLimited = gate.kind === GateDecisionKind.RateLimited;

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
  const openBodyReviewId = getOpenBodyReviewId({ drainedReviewIds, issueComments, newestReview, viewerLogin });
  console.info(
    `open findings: ${openThreads.length} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
  );

  const drainLimitResetMs = readDrainLimitResetMs(issueComments, viewerLogin);
  if (newestReview && (openThreads.length > 0 || openBodyReviewId !== undefined))
    if (isDryRun) console.info("would drain — a dry run runs no Claude session");
    // Claude Code's own limit, read off the marker the run that hit it wrote. Nothing announces it lifting and
    // Every queue push fires a cycle, so without this each one downloads Claude Code to be refused again.
    else if (drainLimitResetMs !== undefined && drainLimitResetMs > Date.now())
      return getOutcome(
        CycleOutcomeKind.Idle,
        `the drain is limited until ${new Date(drainLimitResetMs).toISOString()} — the findings stay open, so nothing ports ahead of them`,
      );
    else {
      const { status, stdout: feedback } = spawnPnpm(["ai:coderabbit:feedback", pullRequest.toString()], {
        cwd: REPOSITORY_ROOT,
        stdio: ["ignore", "pipe", "inherit"],
      });
      if (status !== 0)
        throw new InvalidOperationError(Operation.Read, "coderabbit", "the feedback read failed — see its output");
      const drain = await drainFindings({
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
      if (drain.isLimited)
        return getOutcome(CycleOutcomeKind.Idle, "the drain could not start — the findings stay open");
      reviewFixesSha = drain.reviewFixesSha;
    }

  const port = portWindow({ cwd, developSha, frontierSha: frontier, queueSha, reviewFixesSha });
  console.info(
    `window: ${port.fixCount} fix commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  const isReady = getIsReady({
    fileCount: port.fileCount,
    fixCount: port.fixCount,
    isForced,
    isHeld: port.heldSha !== undefined,
    queueCommitCount: port.queueShas.length,
  });
  if (!isReady) {
    // A port that took nothing under a limit is the one moment the review it refused is owed (`settleRateLimit`)
    if (isRateLimited && port.queueShas.length === 0) {
      const settlement = settleRateLimit({ isDryRun, issueComments, pullRequest, viewerLogin });
      retriggerDelaySeconds = settlement.retriggerDelaySeconds;
      if (settlement.outcome) return settlement.outcome;
    }
    // A held first commit is not an under-filled queue — the window is full of carry-over nothing has reviewed yet
    if (port.queueShas.length === 0 && port.heldSha)
      return getOutcome(CycleOutcomeKind.Idle, "held — no owed commit fits this window");
    else if (port.fixCount > 0) return getOutcome(CycleOutcomeKind.Idle, "parked — fixes wait for the queue");
    return getOutcome(CycleOutcomeKind.Idle, "waiting — the queue is under the fill target");
  }
  if (isDryRun)
    return getOutcome(
      CycleOutcomeKind.Pushed,
      `would verify, fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}`,
    );

  const cut = cutCandidate({
    cwd,
    developSha,
    fixCount: port.fixCount,
    frontierSha: frontier,
    queueSha,
    queueShas: port.queueShas,
  });
  if (cut.queueShas.length === 0 && port.fixCount === 0)
    return getOutcome(CycleOutcomeKind.Idle, "nothing green to push");
  const cutFileCount = getFileCount(`${frontier}..${cut.targetSha}`, cwd);
  console.info(
    `cut: ${cut.queueShas.length} queue commits = ${cutFileCount} files${cut.isMainMerged ? ", main folded in" : ""}${cut.isMainConflicted ? ", main conflicts outside the lockfile — held for a person" : ""}${cut.isFastForward ? ", fast-forward" : ""}`,
  );
  // Readiness is asked again of the cut, because the window that was measured is not the window that ships: the
  // Green cut drops queue commits until the head passes the checks, and a fold of `main` that turned it red is
  // Undone. A cut shrunk past what a slot is worth must not go out — the push is auto-reviewed, so it would
  // Spend the hour the fill target exists to protect on whatever survived. Same rule, asked of the real window.
  // A cut that kept every pick is still the held window; one that dropped a red pick is not, because the drop is
  // Re-picked next cycle and the window can grow again
  const isCutHeld = port.heldSha !== undefined && cut.queueShas.length === port.queueShas.length;
  if (
    !getIsReady({
      fileCount: cutFileCount,
      fixCount: port.fixCount,
      isForced,
      isHeld: isCutHeld,
      queueCommitCount: cut.queueShas.length,
    })
  )
    return getOutcome(
      CycleOutcomeKind.Idle,
      `the green cut is ${cutFileCount} files with ${cut.queueShas.length} queue commits — it waits rather than spending a slot`,
    );

  // A review a person started with a comment while the run worked is read afresh before the push: the push's own
  // Compare-and-swap covers the ref, not the slot
  if (!checkIsSlotFree(readCheckStatus(pullRequest)))
    return getOutcome(
      CycleOutcomeKind.Idle,
      "a review started during the run, or its status could not be read — nothing pushed",
    );
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: cut.targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  replyAnswered(pullRequest, `${developSha}..${cut.targetSha}`, viewerLogin, isDryRun);
  return getOutcome(
    CycleOutcomeKind.Pushed,
    `${cut.queueShas.length} queue commits and ${port.fixCount} fix commits reached ${DEVELOP_BRANCH}`,
    cut.targetSha,
  );
};
