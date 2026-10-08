import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { OpenNextWindowInput } from "#src/models/coderabbit/collect/OpenNextWindowInput";
import type { OpenNextWindowResult } from "#src/models/coderabbit/collect/OpenNextWindowResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { openWindow } from "#src/services/coderabbit/collect/openWindow";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { postHeldNotice } from "#src/services/coderabbit/collect/postHeldNotice";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { replyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";
import { syncFixes } from "#src/services/coderabbit/collect/syncFixes";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One window cut from the top of the stack and opened over it. The fixes and the queue are synced onto `develop`, the
// Port builds the window measured from the top window's head (or `main`'s merge base when none is open) against the
// Same cap, and the window is pushed and opened over the window below. Every ref is read fresh here, since the
// Previous window moved `develop`. `isWindowOpened` says whether one reached the remote; an empty cut says why not.
export const openNextWindow = async ({
  collectorSha,
  cwd,
  drainedPullRequests,
  expressHeldCount,
  isDryRun,
  isFirstWindow,
  openPullRequests,
  viewerLogin,
  windowNumber,
}: OpenNextWindowInput): Promise<OpenNextWindowResult> => {
  const { developSha, mainSha, queueSha, reviewFixesSha } = readBranchShas(cwd);
  const topPullRequest = openPullRequests.at(-1);
  const topSha = topPullRequest === undefined ? undefined : readSha(`origin/${topPullRequest.headRefName}`, cwd);
  if (topPullRequest !== undefined && topSha === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      "coderabbit",
      `${topPullRequest.headRefName} is missing on the remote`,
    );
  const mergeBaseSha = runGit(["merge-base", mainSha, developSha], cwd).trim();
  const windowBaseSha = topSha ?? mergeBaseSha;

  const owedFixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  let owingFixesSha = owedFixShas.length > 0 ? reviewFixesSha : undefined;
  if (owingFixesSha !== undefined) {
    const syncedFixes = await syncFixes({ collectorSha, cwd, developSha, isDryRun, owingFixesSha, viewerLogin });
    if (syncedFixes.outcome) return { isWindowOpened: false, outcome: syncedFixes.outcome };
    owingFixesSha = syncedFixes.owingFixesSha;
  }
  const fixShas = owingFixesSha === undefined ? [] : readCherryShas(developSha, owingFixesSha, cwd);
  const syncedQueueSha = await syncQueue({
    collectorSha,
    cwd,
    developSha,
    isDryRun,
    mergeBaseSha: windowBaseSha,
    owingFixesSha,
    queueSha,
    viewerLogin,
  });
  if (syncedQueueSha === undefined) return { isWindowOpened: false, outcome: getMovedOutcome(QUEUE_BRANCH) };
  const port = portWindow({ cwd, developSha, fixShas, mergeBaseSha: windowBaseSha, queueSha: syncedQueueSha });
  // What `develop` carries above the window below — a window a dying run pushed and never opened — is owed too
  const pendingCommitCount = Number(runGit(["rev-list", "--count", `${windowBaseSha}..${developSha}`], cwd).trim());
  console.info(
    `window: ${port.fixCount} fix commits + ${pendingCommitCount} pending commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  const isReady = port.fixCount > 0 || pendingCommitCount + port.queueShas.length > 0;
  if (!isReady) {
    // A held first commit is the residual person's case: the reshaper or the resolver failed on it past the attempt
    // Cap, and no event clears that. It is noted and the run fails red so someone is told. A later cut of this run
    // Only reports it, and the next run's first cut does the telling.
    if (port.queueShas.length === 0 && port.heldSha) {
      if (isDryRun)
        return {
          isWindowOpened: false,
          outcome: {
            kind: CycleOutcomeKind.Idle,
            reason: `held at ${port.heldSha} — a dry run reshapes and resolves nothing`,
          },
        };
      else if (!isFirstWindow)
        return {
          isWindowOpened: false,
          outcome: {
            kind: CycleOutcomeKind.Idle,
            reason: `held at ${port.heldSha} — the windows opened this run are as far as the queue goes until it is answered`,
          },
        };
      postHeldNotice(port.heldSha, isDryRun, viewerLogin);
      throw new InvalidOperationError(
        Operation.Update,
        "coderabbit",
        `held at ${port.heldSha} — the first owed commit could not be reshaped under the cap or its conflict was not resolved past the attempt cap, so a person splits it or rebases ${QUEUE_BRANCH} (its commit comments say which)`,
      );
    }
    // A claimed commit no cut carried is owed to `main` still, and the port never counts it: said here, or an idle
    // Run reads as a synced queue over a commit still owed to `main`
    else if (expressHeldCount > 0)
      return {
        isWindowOpened: false,
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: `${expressHeldCount} claimed commits wait on the express lane — a patch that does not apply to ${MAIN_BRANCH} yet`,
        },
      };
    return {
      isWindowOpened: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `nothing owed — ${QUEUE_BRANCH} is synced with ${DEVELOP_BRANCH}`,
      },
    };
  }

  // Ready with nothing to add: `develop` already carries the window, and only its pull request is owed
  const isDevelopCarryingWindow = port.queueShas.length === 0 && port.fixCount === 0;
  if (!isDevelopCarryingWindow && isDryRun)
    return {
      isWindowOpened: false,
      outcome: {
        kind: CycleOutcomeKind.Pushed,
        reason: `would fold ${MAIN_BRANCH} in and push the window to ${DEVELOP_BRANCH}, then open it`,
      },
    };
  const targetSha = isDevelopCarryingWindow
    ? developSha
    : await foldCandidate({
        collectorSha,
        cwd,
        developSha,
        fixCount: port.fixCount,
        mergeBaseSha: windowBaseSha,
        queueSha: syncedQueueSha,
        queueShas: port.queueShas,
        viewerLogin,
      });

  const outcome: CycleOutcome = openWindow({
    baseBranch: topPullRequest?.headRefName ?? MAIN_BRANCH,
    baseSha: topSha ?? mainSha,
    cwd,
    developSha,
    isDryRun,
    targetSha,
    windowNumber,
  });
  if (outcome.kind === CycleOutcomeKind.Opened) {
    const answeredCommits = readAnsweredCommits([`${developSha}..${targetSha}`], cwd);
    for (const pullRequest of drainedPullRequests)
      replyPullRequestAnswers({ commits: answeredCommits, isDryRun, pullRequest, viewerLogin });
  }
  return { isWindowOpened: outcome.kind === CycleOutcomeKind.Opened, outcome };
};
