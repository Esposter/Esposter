import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { OpenNextWindowInput } from "#src/models/coderabbit/collect/OpenNextWindowInput";
import type { OpenNextWindowResult } from "#src/models/coderabbit/collect/OpenNextWindowResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  DEVELOP_BRANCH,
  MAIN_BRANCH,
  QUEUE_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { foldCandidate } from "#src/services/coderabbit/collect/foldCandidate";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { openWindow } from "#src/services/coderabbit/collect/openWindow";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readWindowFileCount } from "#src/services/coderabbit/collect/readWindowFileCount";
import { replyPullRequestAnswers } from "#src/services/coderabbit/collect/replyPullRequestAnswers";
import { syncFixes } from "#src/services/coderabbit/collect/syncFixes";
import { syncQueue } from "#src/services/coderabbit/collect/syncQueue";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One window cut from the top of the stack and opened over it. The fixes and the queue are synced onto `develop`, the
// Port builds the window measured from the base the bot reviews it against (the top window's head, or `main` when none
// Is open) against the cap it is given, and the window is pushed and opened over the window below. Every ref is read
// Fresh here, since the previous window moved `develop`. `isWindowOpened` says whether one reached the remote; an
// Empty cut says why not.
export const openNextWindow = async ({
  collectorSha,
  cwd,
  drainedPullRequests,
  expressHeldCount,
  fileCap,
  isDryRun,
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
  // The base the bot reviews this window against, which every count of the window is taken from
  const baseSha = topSha ?? mainSha;

  const owedFixShas = reviewFixesSha === undefined ? [] : readCherryShas(developSha, reviewFixesSha, cwd);
  let owingFixesSha = owedFixShas.length > 0 ? reviewFixesSha : undefined;
  if (owingFixesSha !== undefined) {
    const syncedFixes = await syncFixes({ collectorSha, cwd, developSha, isDryRun, owingFixesSha, viewerLogin });
    if (syncedFixes.outcome) return { isWindowOpened: false, outcome: syncedFixes.outcome };
    owingFixesSha = syncedFixes.owingFixesSha;
  }
  const fixShas = owingFixesSha === undefined ? [] : readCherryShas(developSha, owingFixesSha, cwd);
  const syncedQueueSha = await syncQueue({
    baseSha,
    collectorSha,
    cwd,
    developSha,
    fileCap,
    isDryRun,
    owingFixesSha,
    queueSha,
    viewerLogin,
  });
  if (syncedQueueSha === undefined) return { isWindowOpened: false, outcome: getMovedOutcome(QUEUE_BRANCH) };
  const port = portWindow({ baseSha, cwd, developSha, fileCap, fixShas, queueSha: syncedQueueSha });
  // What `develop` carries above the window below — a window a dying run pushed and never opened — is owed too
  const pendingCommitCount = Number(runGit(["rev-list", "--count", `${baseSha}..${developSha}`], cwd).trim());
  console.info(
    `window: ${port.fixCount} fix commits + ${pendingCommitCount} pending commits + ${port.queueShas.length} queue commits = ${port.fileCount} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  const isReady = port.fixCount > 0 || pendingCommitCount + port.queueShas.length > 0;
  if (!isReady) {
    // A held first commit is the residual case, since the sync parks what its caps exhaust: one the port still cannot
    // Take is parked too, out of the owed set, and the run wakes a minute later to cut what follows it
    if (port.queueShas.length === 0 && port.heldSha) {
      if (isDryRun)
        return {
          isWindowOpened: false,
          outcome: {
            kind: CycleOutcomeKind.Idle,
            reason: `held at ${port.heldSha} — a dry run reshapes and resolves nothing`,
          },
        };
      parkCommits({ cause: "no window could carry it", cwd, isDryRun, shas: [port.heldSha], viewerLogin });
      return {
        isWindowOpened: false,
        outcome: {
          kind: CycleOutcomeKind.Idle,
          reason: `parked ${port.heldSha}, which no window could carry — the queue is cut again without it`,
          retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
        },
      };
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
        baseSha,
        collectorSha,
        cwd,
        developSha,
        fixCount: port.fixCount,
        queueSha: syncedQueueSha,
        queueShas: port.queueShas,
        viewerLogin,
      });
  // The fold is the one step the port never measured: on a window stacked above another, the `main` it brings is in the
  // Bot's count, so a cut over the cap is held until the stack below moves and the next run measures it again
  const foldedFileCount = readWindowFileCount(baseSha, cwd, targetSha);
  if (!isDevelopCarryingWindow && foldedFileCount > fileCap)
    return {
      isWindowOpened: false,
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `the cut with ${MAIN_BRANCH} folded in is ${foldedFileCount} files, over the cap of ${fileCap} — held until the window below merges`,
      },
    };

  const outcome: CycleOutcome = openWindow({
    baseBranch: topPullRequest?.headRefName ?? MAIN_BRANCH,
    baseSha,
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
