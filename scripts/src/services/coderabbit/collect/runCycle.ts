import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  MERGEABLE_RISK_LEVEL,
  QUEUE_BRANCH,
  SKIPPED_REVIEW_COMMENT_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { foldReleaseMain } from "#src/services/coderabbit/collect/foldReleaseMain";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getMergeRisk } from "#src/services/coderabbit/collect/getMergeRisk";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { judgeRelease } from "#src/services/coderabbit/collect/judgeRelease";
import { mergeReleasePullRequest } from "#src/services/coderabbit/collect/mergeReleasePullRequest";
import { openReleasePullRequest } from "#src/services/coderabbit/collect/openReleasePullRequest";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { postHeldNotice } from "#src/services/coderabbit/collect/postHeldNotice";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readReleasePullRequest } from "#src/services/coderabbit/collect/readReleasePullRequest";
import { readReleaseState } from "#src/services/coderabbit/collect/readReleaseState";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One pass: read, reply, gate, drain, sync, port, push, reply. Every input is a remote fact and every write is either
// The single fast-forward push or guarded by a predicate a later run re-evaluates, so any event may run this
// And a run against unchanged state does nothing. It returns its verdict rather than exiting, which is what
// Makes a dry run one mode of the same code path (docs: infra/review-collector).
export const runCycle = async ({
  collectorSha,
  cwd,
  isDryRun,
  pullRequest: namedPullRequest,
}: CycleInput): Promise<CycleOutcome> => {
  // Every outcome from the gate down carries whatever retrigger the bot's stated deadline owes
  let retriggerDelaySeconds: number | undefined;
  const getOutcome = (kind: CycleOutcomeKind, reason: string, targetSha?: string): CycleOutcome => ({
    kind,
    reason,
    retriggerDelaySeconds,
    targetSha,
  });

  const branchShas = readBranchShas(cwd);
  const { mainSha, queueSha } = branchShas;
  // The drain may create or advance the fixes branch mid-pass, so this one is carried rather than re-read
  let reviewFixesSha = branchShas.reviewFixesSha;
  // The return stroke first: a release that merged moves `develop` before anything is measured against it
  const returned = runReturnStroke({ cwd, developSha: branchShas.developSha, isDryRun, mainSha });
  if (returned.outcome) return returned.outcome;
  const { developSha } = returned;
  const viewerLogin = readViewerLogin();
  // The express lane, before the pull request is even looked up: a commit claiming no review reaches `main`
  // Directly and the fold carries it to `develop` with the next window — and a red `main` its cut cannot pass is
  // Repaired by the lane's own cut
  const expressed = await runExpressLane({
    collectorSha,
    cwd,
    developSha,
    isDryRun,
    mainSha,
    queueSha,
    viewerLogin,
  });
  if (expressed.outcome) return expressed.outcome;
  // No release pull request: the last one merged and the next window is still filling from the merge base
  const releasePullRequest = namedPullRequest === undefined ? readReleasePullRequest() : undefined;
  // Closed without merging is a person's pause: opening another over it would spend the slot they were withholding
  if (releasePullRequest?.state === ReleasePullRequestState.Closed)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${releasePullRequest.number} was closed without merging — a person's pause, re-open it to resume`,
    );
  const pullRequest =
    namedPullRequest ??
    (releasePullRequest?.state === ReleasePullRequestState.Open ? releasePullRequest.number : undefined);
  const { frontier, issueComments, lastReviewedSha, reviews } = readReleaseState({
    cwd,
    developSha,
    mainSha,
    pullRequest,
  });
  console.info(
    `pull request ${pullRequest === undefined ? "none" : `#${pullRequest}`} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`,
  );
  console.info(`develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nfrontier ${frontier}`);

  const frontierCommits = readAnsweredCommits([`${frontier}..${developSha}`], cwd);
  // Replies before any exit: a run that pushed and died before replying is finished here by whichever event fires next
  if (pullRequest !== undefined)
    replyAnswered({ commits: frontierCommits, isDryRun, issueComments, pullRequest, viewerLogin });

  const gate =
    pullRequest === undefined
      ? { kind: GateDecisionKind.Proceed, reason: "no release pull request — nothing can be running" }
      : getGateDecision({
          checkStatus: readCheckStatus(pullRequest),
          developSha,
          isReviewSkipped: issueComments.some((comment) =>
            checkIsMarked(comment, CODERABBIT_REST_LOGIN, SKIPPED_REVIEW_COMMENT_MARKER),
          ),
          lastReviewedSha,
        });
  console.info(`gate: ${gate.kind} — ${gate.reason}`);
  if (gate.kind === GateDecisionKind.Exit) return getOutcome(CycleOutcomeKind.Idle, gate.reason);
  else if (gate.kind === GateDecisionKind.Fail)
    throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
  // Rate limited: the slot is free and the review it skipped is owed once the port has said nothing can be added
  const isRateLimited = gate.kind === GateDecisionKind.RateLimited;

  if (pullRequest !== undefined) {
    const drain = await runDrainStep({
      collectorSha,
      cwd,
      developSha,
      frontierCommits,
      isDryRun,
      issueComments,
      pullRequest,
      queueSha,
      reviewFixesSha,
      reviews,
      viewerLogin,
    });
    if (drain.outcome) return drain.outcome;
    reviewFixesSha = drain.reviewFixesSha;
    // A review that ends at the head and left nothing open is a release: the bot's own risk verdict on that head
    // Is the last word when it is the least, and a reading of what it did write against the tree otherwise. A
    // Block naming an older head, or no block at all, states nothing about this one — the bot writes one on some
    // Releases and not others, for no reason this side can read — so that is a head to judge and never a head to
    // Wait on: a clean release held for a block nobody promised is held forever, and reads as `Idle` while it is.
    // A head the bot skipped has no review to wait on and no block of its own: the last block it wrote is the only
    // Rating there is, so the verdict weighs it beside the commits no review read — and never merges on it unasked
    const mergeRisk = getMergeRisk(issueComments);
    const isReviewSkipped = gate.kind === GateDecisionKind.ReviewSkipped;
    const level = mergeRisk?.coveredSha === developSha || isReviewSkipped ? mergeRisk?.level : undefined;
    if ((gate.kind === GateDecisionKind.Proceed || isReviewSkipped) && drain.isClean) {
      const folded = await foldReleaseMain({ collectorSha, cwd, developSha, isDryRun, mainSha, viewerLogin });
      if (folded) return folded;
      if (level === MERGEABLE_RISK_LEVEL && !isReviewSkipped)
        return mergeReleasePullRequest({ developSha, isDryRun, pullRequest });
      const judged = await judgeRelease({
        cwd,
        developSha,
        isDryRun,
        issueComments,
        level,
        pullRequest,
        reviews,
        unreviewedFromSha: isReviewSkipped ? frontier : undefined,
        viewerLogin,
      });
      if (judged) return judged;
    }
  }
  // What the fixes branch still owes develop, settled once the drain has finished moving it: the sync replays the
  // Queue onto that tree and the port builds the window on top of the same commits, so both read one answer
  const fixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  const owingFixesSha = fixShas.length > 0 ? reviewFixesSha : undefined;
  // The queue is rebuilt on the tree the window is built on before the port reads it, so a conflict is met here
  // Once rather than held on every run
  const syncedQueueSha = await syncQueue({
    collectorSha,
    cwd,
    developSha,
    isDryRun,
    owingFixesSha,
    queueSha,
    viewerLogin,
  });
  if (syncedQueueSha === undefined) return getMovedOutcome(QUEUE_BRANCH);
  const port = portWindow({ cwd, developSha, fixShas, frontierSha: frontier, queueSha: syncedQueueSha });
  // With no pull request open, what `develop` already carries above the merge base is the first review's window
  const pendingCommitCount =
    pullRequest === undefined ? Number(runGit(["rev-list", "--count", `${frontier}..${developSha}`], cwd).trim()) : 0;
  console.info(
    `window: ${port.fixCount} fix commits + ${pendingCommitCount} pending commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  // Anything owed goes out, at whatever size the port reached: there is no floor under the cap because the port
  // Already took every commit the queue owes, and fixes alone spend the slot rather than wait on a push nothing
  // Has promised — a limit refusing the review arrives as an event, and the retrigger asks for it again
  const isReady = port.fixCount > 0 || pendingCommitCount + port.queueShas.length > 0;
  if (!isReady) {
    // A port that took nothing under a limit is the one moment the review it refused is owed (`settleRateLimit`)
    if (isRateLimited && pullRequest !== undefined && port.queueShas.length === 0) {
      const settlement = settleRateLimit({ isDryRun, issueComments, pullRequest, viewerLogin });
      retriggerDelaySeconds = settlement.retriggerDelaySeconds;
      if (settlement.outcome) return settlement.outcome;
    }
    // A held first commit is the residual person's case: the reshaper or the resolver failed on it past the
    // Attempt cap, and no event clears that. The commit is told first, then the run fails red so someone is —
    // Once the review a limit refused has been asked for, since that answer is still owed first and a throw here
    // Would lose the retrigger the job output carries.
    if (port.queueShas.length === 0 && port.heldSha) {
      // A dry run reshapes and resolves nothing, so its hold says nothing about a live run's
      if (isDryRun)
        return getOutcome(CycleOutcomeKind.Idle, `held at ${port.heldSha} — a dry run reshapes and resolves nothing`);
      postHeldNotice(port.heldSha, isDryRun, viewerLogin);
      if (isRateLimited) return getOutcome(CycleOutcomeKind.Idle, "held — the review the limit refused is owed first");
      throw new InvalidOperationError(
        Operation.Update,
        "coderabbit",
        `held at ${port.heldSha} — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ${QUEUE_BRANCH} (its commit comments say which)`,
      );
    }
    // A claimed commit no cut carried is owed to `main` still, and the port never counts it: said here, or an
    // Idle run reads as a synced queue over a commit still owed to `main`
    else if (expressed.heldShas.length > 0)
      return getOutcome(
        CycleOutcomeKind.Idle,
        `${expressed.heldShas.length} claimed commits wait on the express lane — a patch that does not apply to ${MAIN_BRANCH} yet`,
      );
    return getOutcome(CycleOutcomeKind.Idle, `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`);
  }
  // Ready with nothing to add: develop already carries the window, and only the pull request is owed
  if (port.queueShas.length === 0 && port.fixCount === 0)
    return openReleasePullRequest({ cwd, developSha, isDryRun, mainSha });
  else if (isDryRun)
    return getOutcome(
      CycleOutcomeKind.Pushed,
      `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}${pullRequest === undefined ? ", then open the release pull request" : ""}`,
    );

  const targetSha = await foldCandidate({
    collectorSha,
    cwd,
    developSha,
    fixCount: port.fixCount,
    frontierSha: frontier,
    queueSha: syncedQueueSha,
    queueShas: port.queueShas,
    viewerLogin,
  });
  // The push's compare-and-swap covers the ref, not the slot: a review a person started meanwhile is read afresh
  if (pullRequest !== undefined && !checkIsSlotFree(readCheckStatus(pullRequest)))
    return getOutcome(
      CycleOutcomeKind.Idle,
      "a review started during the run, or its status could not be read — nothing pushed",
    );
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  if (pullRequest === undefined) return openReleasePullRequest({ cwd, developSha: targetSha, isDryRun, mainSha });
  replyAnswered({
    commits: readAnsweredCommits([`${developSha}..${targetSha}`], cwd),
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
