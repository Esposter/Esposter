import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { openReleasePullRequest } from "#src/services/coderabbit/collect/openReleasePullRequest";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readReleasePullRequest } from "#src/services/coderabbit/collect/readReleasePullRequest";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getLastReviewedSha } from "#src/services/coderabbit/window/getLastReviewedSha";
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
  // Named one by one: a ref missing from the remote is the copy of the cycle that runs disagreeing with the remote
  // About a name, and which name is the whole of the diagnosis
  const missingBranches = [
    [MAIN_BRANCH, mainSha],
    [QUEUE_BRANCH, queueSha],
    [DEVELOP_BRANCH, developSha],
  ]
    .filter(([, sha]) => !sha)
    .map(([branch]) => `origin/${branch}`);
  if (!developSha || !queueSha || !mainSha)
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `missing on the remote: ${missingBranches.join(", ")}`,
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

  // No release pull request means the last one merged and the next window is still filling: nothing is running,
  // Nothing is open, and the frontier is the merge base — the range the pull request's first review will read
  // Once this cycle opens it (`openReleasePullRequest`).
  const releasePullRequest = namedPullRequest === undefined ? readReleasePullRequest() : undefined;
  // A pull request a person closed without merging is their pause, not a window that filled: re-opening it hands
  // The cycle back, and opening another over it would spend the slot they were withholding
  if (releasePullRequest?.state === ReleasePullRequestState.Closed)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${releasePullRequest.number} was closed without merging — a person's pause, re-open it to resume`,
    );
  const pullRequest =
    namedPullRequest ??
    (releasePullRequest?.state === ReleasePullRequestState.Open ? releasePullRequest.number : undefined);
  const reviews = pullRequest === undefined ? [] : readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`);
  const lastReviewedSha = getLastReviewedSha(reviews.map(({ body }) => body));
  const frontier = lastReviewedSha ?? runGit(["merge-base", mainSha, developSha]).trim();
  const viewerLogin = readViewerLogin();
  console.info(
    `pull request ${pullRequest === undefined ? "none" : `#${pullRequest}`} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`,
  );
  console.info(`develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nfrontier ${frontier}`);

  const issueComments = pullRequest === undefined ? [] : readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);
  const frontierCommits = readAnsweredCommits(`${frontier}..${developSha}`);
  // Replies first: a run that pushed and died before replying is finished here, by whichever event fires next,
  // And it must happen before any exit — the running review is the one that resolves these threads.
  if (pullRequest !== undefined)
    replyAnswered({ commits: frontierCommits, isDryRun, issueComments, pullRequest, viewerLogin });

  const gate =
    pullRequest === undefined
      ? { kind: GateDecisionKind.Proceed, reason: "no release pull request — nothing can be running" }
      : getGateDecision({ checkStatus: readCheckStatus(pullRequest), developSha, lastReviewedSha });
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
  const drainedReviewIds = new Set([...unportedCommits, ...frontierCommits].flatMap(({ drains }) => drains));
  const threads = pullRequest === undefined ? [] : readUnresolvedThreads(pullRequest);
  const openThreads = getOpenFindings(threads, answeredIds);
  const openBodyReviewId = getOpenBodyReviewId({ drainedReviewIds, issueComments, newestReview, viewerLogin });
  console.info(
    `open findings: ${openThreads.length} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
  );
  if (pullRequest !== undefined) {
    const drain = await runDrainStep({
      developSha,
      isDryRun,
      issueComments,
      newestReview,
      openBodyReviewId,
      openThreads,
      pullRequest,
      reviewFixesSha,
      threads,
      viewerLogin,
    });
    if (drain.outcome) return drain.outcome;
    reviewFixesSha = drain.reviewFixesSha;
  }

  const port = portWindow({ cwd, developSha, frontierSha: frontier, queueSha, reviewFixesSha });
  // With no pull request open, whatever `develop` already carries above the merge base is part of the window the
  // First review reads — a run that pushed and died before opening left it there
  const pendingCommitCount =
    pullRequest === undefined ? Number(runGit(["rev-list", "--count", `${frontier}..${developSha}`]).trim()) : 0;
  console.info(
    `window: ${port.fixCount} fix commits + ${pendingCommitCount} pending commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  // Fixes parked with no pull request open answered findings of the one that merged: they ride the window, but
  // They lead nothing and force nothing — the fill target decides, or a pull request would open on them alone
  const parkedFixCount = pullRequest === undefined ? 0 : port.fixCount;
  const isReady = getIsReady({
    fileCount: port.fileCount,
    fixCount: parkedFixCount,
    isForced,
    isHeld: port.heldSha !== undefined,
    pendingCommitCount,
    queueCommitCount: port.queueShas.length,
  });
  if (!isReady) {
    // A port that took nothing under a limit is the one moment the review it refused is owed (`settleRateLimit`)
    if (isRateLimited && pullRequest !== undefined && port.queueShas.length === 0) {
      const settlement = settleRateLimit({ isDryRun, issueComments, pullRequest, viewerLogin });
      retriggerDelaySeconds = settlement.retriggerDelaySeconds;
      if (settlement.outcome) return settlement.outcome;
    }
    // A held first commit is not an under-filled queue — the window is full of carry-over nothing has reviewed yet
    if (port.queueShas.length === 0 && port.heldSha)
      return getOutcome(CycleOutcomeKind.Idle, "held — no owed commit fits this window");
    else if (parkedFixCount > 0) return getOutcome(CycleOutcomeKind.Idle, "parked — fixes wait for the queue");
    return getOutcome(CycleOutcomeKind.Idle, "waiting — the queue is under the fill target");
  }
  // Ready with nothing to add: develop already carries the window, and only the pull request is owed
  if (port.queueShas.length === 0 && port.fixCount === 0)
    return openReleasePullRequest({ cwd, developSha, isDryRun, mainSha });
  else if (isDryRun)
    return getOutcome(
      CycleOutcomeKind.Pushed,
      `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}${pullRequest === undefined ? ", then open the release pull request" : ""}`,
    );

  const targetSha = foldCandidate({
    cwd,
    developSha,
    fixCount: port.fixCount,
    frontierSha: frontier,
    queueSha,
    queueShas: port.queueShas,
  });
  // A review a person started with a comment while the run worked is read afresh before the push: the push's own
  // Compare-and-swap covers the ref, not the slot
  if (pullRequest !== undefined && !checkIsSlotFree(readCheckStatus(pullRequest)))
    return getOutcome(
      CycleOutcomeKind.Idle,
      "a review started during the run, or its status could not be read — nothing pushed",
    );
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  // The window is on `develop`; what is owed now is the pull request that reviews it, or the replies the one
  // Reviewing it resolves
  if (pullRequest === undefined) return openReleasePullRequest({ cwd, developSha: targetSha, isDryRun, mainSha });
  replyAnswered({
    commits: readAnsweredCommits(`${developSha}..${targetSha}`),
    isDryRun,
    issueComments,
    pullRequest,
    viewerLogin,
  });
  return getOutcome(
    CycleOutcomeKind.Pushed,
    `${port.queueShas.length} queue commits and ${port.fixCount} fix commits reached ${DEVELOP_BRANCH}`,
    targetSha,
  );
};
