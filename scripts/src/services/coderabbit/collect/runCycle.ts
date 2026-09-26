import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { ReleasePullRequestState } from "#src/models/coderabbit/collect/ReleasePullRequestState";
import { DEVELOP_BRANCH, MAIN_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { foldReleaseMain } from "#src/services/coderabbit/collect/foldReleaseMain";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
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
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { runDrainStep } from "#src/services/coderabbit/collect/runDrainStep";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { settleRateLimit } from "#src/services/coderabbit/collect/settleRateLimit";
import { syncFixes } from "#src/services/coderabbit/collect/syncFixes";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One pass: return, express, then either the open release — gate, merge — or the merged one — reply, drain, sync,
// Port, push, reply, open. Every input is a remote fact and every write is either the single push or guarded by a
// Predicate a later run re-evaluates, so any event may run this and a run against unchanged state does nothing. It
// Returns its verdict rather than exiting, which is what makes a dry run one mode of the same code path (docs:
// Infra/review-collector).
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
  const expressed = await runExpressLane({ collectorSha, cwd, developSha, isDryRun, mainSha, queueSha, viewerLogin });
  if (expressed.outcome) return expressed.outcome;
  // Read whether a pull request is named or not: a window pushed under an open release would merge with it unread
  const releasePullRequest = readReleasePullRequest();
  // Closed without merging is a person's pause: opening another over it would spend the slot they were withholding
  if (releasePullRequest?.state === ReleasePullRequestState.Closed)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${releasePullRequest.number} was closed without merging — a person's pause, re-open it to resume`,
    );
  // An open release gets one review and merges the moment it completes: nothing reaches `develop` while it is open,
  // So no incremental review is ever asked for, and its findings are drained after the merge
  else if (releasePullRequest?.state === ReleasePullRequestState.Open) {
    const openPullRequest = releasePullRequest.number;
    const gate = getGateDecision(readCheckStatus(openPullRequest));
    console.info(`pull request #${openPullRequest} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`);
    console.info(`gate: ${gate.kind} — ${gate.reason}`);
    if (gate.kind === GateDecisionKind.Exit) return getOutcome(CycleOutcomeKind.Idle, gate.reason);
    else if (gate.kind === GateDecisionKind.Fail)
      throw new InvalidOperationError(Operation.Read, "coderabbit", gate.reason);
    else if (gate.kind === GateDecisionKind.RateLimited) {
      const settlement = settleRateLimit({
        isDryRun,
        issueComments: readEntries<GitHubEntry>(`issues/${openPullRequest}/comments`),
        pullRequest: openPullRequest,
        viewerLogin,
      });
      retriggerDelaySeconds = settlement.retriggerDelaySeconds;
      return settlement.outcome ?? getOutcome(CycleOutcomeKind.Idle, gate.reason);
    }
    const folded = await foldReleaseMain({ collectorSha, cwd, developSha, isDryRun, mainSha, viewerLogin });
    return folded ?? mergeReleasePullRequest({ developSha, isDryRun, pullRequest: openPullRequest });
  }
  // No release open: the newest merged one is the review the next window answers, its fixes leading it
  const pullRequest =
    namedPullRequest ??
    (releasePullRequest?.state === ReleasePullRequestState.Merged ? releasePullRequest.number : undefined);
  const mergeBaseSha = runGit(["merge-base", mainSha, developSha], cwd).trim();
  console.info(
    `merged pull request ${pullRequest === undefined ? "none" : `#${pullRequest}`} as ${viewerLogin}${isDryRun ? " (dry run)" : ""}`,
  );
  console.info(
    `develop ${developSha}\nqueue   ${queueSha}\nfixes   ${reviewFixesSha ?? "none"}\nbase    ${mergeBaseSha}`,
  );
  // What `develop` carries above `main` — a window a dying run pushed and never opened — answers findings already
  const developCommits = readAnsweredCommits([`${mergeBaseSha}..${developSha}`], cwd);
  if (pullRequest !== undefined) {
    const issueComments = readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);
    // Replies before any exit: a run that pushed and died before replying is finished by whichever event fires next
    replyAnswered({ commits: developCommits, isDryRun, issueComments, pullRequest, viewerLogin });
    const drain = await runDrainStep({
      collectorSha,
      cwd,
      developCommits,
      developSha,
      isDryRun,
      issueComments,
      pullRequest,
      queueSha,
      reviewFixesSha,
      reviews: readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`),
      viewerLogin,
    });
    if (drain.outcome) return drain.outcome;
    reviewFixesSha = drain.reviewFixesSha;
  }
  // What the fixes branch still owes develop, settled once the drain has finished moving it and the fixes sit on
  // Develop: the sync replays the queue onto that tree and the port builds the window on top of the same
  // Commits, so both read one answer
  const owedFixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  let owingFixesSha = owedFixShas.length > 0 ? reviewFixesSha : undefined;
  if (owingFixesSha !== undefined) {
    const syncedFixes = await syncFixes({ collectorSha, cwd, developSha, isDryRun, owingFixesSha, viewerLogin });
    if (syncedFixes.outcome) return syncedFixes.outcome;
    owingFixesSha = syncedFixes.owingFixesSha;
  }
  const fixShas = owingFixesSha === undefined ? [] : readCherryShas(developSha, owingFixesSha, cwd);
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
  const port = portWindow({ cwd, developSha, fixShas, mergeBaseSha, queueSha: syncedQueueSha });
  // What `develop` already carries above the merge base is the release's window as much as what the port adds
  const pendingCommitCount = Number(runGit(["rev-list", "--count", `${mergeBaseSha}..${developSha}`], cwd).trim());
  console.info(
    `window: ${port.fixCount} fix commits + ${pendingCommitCount} pending commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  // Anything owed goes out, at whatever size the port reached: there is no floor under the cap because the port
  // Already took every commit the queue owes, and fixes alone spend the slot rather than wait on a push nothing
  // Has promised — a limit refusing the review arrives as an event, and the retrigger asks for it again
  const isReady = port.fixCount > 0 || pendingCommitCount + port.queueShas.length > 0;
  if (!isReady) {
    // A held first commit is the residual person's case: the reshaper or the resolver failed on it past the
    // Attempt cap, and no event clears that. The commit is told first, then the run fails red so someone is.
    if (port.queueShas.length === 0 && port.heldSha) {
      // A dry run reshapes and resolves nothing, so its hold says nothing about a live run's
      if (isDryRun)
        return getOutcome(CycleOutcomeKind.Idle, `held at ${port.heldSha} — a dry run reshapes and resolves nothing`);
      postHeldNotice(port.heldSha, isDryRun, viewerLogin);
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
      `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}, then open the release pull request`,
    );

  const targetSha = await foldCandidate({
    collectorSha,
    cwd,
    developSha,
    fixCount: port.fixCount,
    mergeBaseSha,
    queueSha: syncedQueueSha,
    queueShas: port.queueShas,
    viewerLogin,
  });
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  if (pullRequest !== undefined)
    replyAnswered({
      commits: readAnsweredCommits([`${developSha}..${targetSha}`], cwd),
      isDryRun,
      issueComments: readEntries<GitHubEntry>(`issues/${pullRequest}/comments`),
      pullRequest,
      viewerLogin,
    });
  return openReleasePullRequest({ cwd, developSha: targetSha, isDryRun, mainSha });
};
