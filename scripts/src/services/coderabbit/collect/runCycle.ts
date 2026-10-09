import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { checkIsStackingAllowed } from "#src/services/coderabbit/collect/checkIsStackingAllowed";
import { DEVELOP_BRANCH, MAIN_BRANCH, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { drainWindow } from "#src/services/coderabbit/collect/drainWindow";
import { getNewestMergedPullRequest } from "#src/services/coderabbit/collect/getNewestMergedPullRequest";
import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";
import { getNextWindowNumber } from "#src/services/coderabbit/collect/getNextWindowNumber";
import { getOpenedInLastHour } from "#src/services/coderabbit/collect/getOpenedInLastHour";
import { getOpeningWaitMs } from "#src/services/coderabbit/collect/getOpeningWaitMs";
import { getPausedWindow } from "#src/services/coderabbit/collect/getPausedWindow";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getSoonestDelay } from "#src/services/coderabbit/collect/getSoonestDelay";
import { getWindowOpenCount } from "#src/services/coderabbit/collect/getWindowOpenCount";
import { markFoldedWindowsMerged } from "#src/services/coderabbit/collect/markFoldedWindowsMerged";
import { openNextWindow } from "#src/services/coderabbit/collect/openNextWindow";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCoderabbitConfig } from "#src/services/coderabbit/collect/readCoderabbitConfig";
import { readLegacyReleasePullRequest } from "#src/services/coderabbit/collect/readLegacyReleasePullRequest";
import { readMergedPullRequestsSince } from "#src/services/coderabbit/collect/readMergedPullRequestsSince";
import { readSessionLimitResetMs } from "#src/services/coderabbit/collect/readSessionLimitResetMs";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { retargetStrandedWindows } from "#src/services/coderabbit/collect/retargetStrandedWindows";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { walkWindowStack } from "#src/services/coderabbit/collect/walkWindowStack";
import { REVIEW_FILE_CAP, REVIEWS_PER_HOUR } from "#src/services/coderabbit/shared/constants";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// An outcome carries the retrigger a hold lifting at a stated instant owes — a rate limit's deadline, the reset Claude
// Code's limit names, the hourly ceiling turning over — since no event reports any of them lifting
const getOutcome = (
  kind: CycleOutcomeKind,
  reason: string,
  retriggerDelaySeconds?: number,
  targetSha?: string,
): CycleOutcome => ({ kind, reason, retriggerDelaySeconds, targetSha });

// A window is cut over the top of the open stack and CodeRabbit reviews it under the config its base carries, so the
// Guard reads the top's copy. With nothing open the window is cut over `main`, which needs no guard
const checkIsStackingAllowedOver = (openStack: WindowPullRequest[], cwd: string): boolean => {
  const top = openStack.at(-1);
  return top === undefined || checkIsStackingAllowed(readCoderabbitConfig(top.headRefName, cwd), top.headRefName);
};

// One pass: return, express, then the open stack — the release from `develop` while it is open, and each window's gate,
// The bottom one merged and drained once its review completes — and then as many windows opened as the hourly ceiling
// And the stacking guard allow, each cut from the top of the stack. Every input is a remote fact and every write is
// Either a push or guarded by a predicate a later run re-evaluates, so any event may run this and a run against
// Unchanged state does nothing. It returns its verdict rather than exiting, which is what makes a dry run one mode of
// The same code path (docs: infra/review-collector).
export const runCycle = async ({
  collectorSha,
  cwd,
  isDryRun,
  pullRequest: namedPullRequest,
}: CycleInput): Promise<CycleOutcome> => {
  const branchShas = readBranchShas(cwd);
  const { mainSha, queueSha } = branchShas;
  const viewerLogin = readViewerLogin();
  const windowHistory = markFoldedWindowsMerged(readWindowPullRequests(WindowPullRequestListState.All), mainSha, cwd);
  // A merge whose retarget failed strands the window above it, which is retargeted before the stack is read
  const openPullRequests = retargetStrandedWindows({
    cwd,
    isDryRun,
    openPullRequests: readWindowPullRequests(WindowPullRequestListState.Open),
    windowHistory,
  });
  // The release from `develop` to `main` that predates the stack is the stack's bottom while it is open: it is gated,
  // Merged and drained as a window is, and never retargeted or deleted, since `develop` is its head
  const legacyPullRequest = readLegacyReleasePullRequest();
  const stackPullRequests =
    legacyPullRequest?.state === WindowPullRequestState.Open
      ? [legacyPullRequest, ...openPullRequests]
      : openPullRequests;
  // The return stroke first: a stack that merged moves `develop` before anything is measured against it, and an open
  // Stack keeps `develop` on its top window
  const returned = runReturnStroke({
    cwd,
    developSha: branchShas.developSha,
    isDryRun,
    isStackOpen: stackPullRequests.length > 0,
    mainSha,
  });
  if (returned.outcome) return returned.outcome;
  const { developSha } = returned;
  // A limit Claude Code hit holds everything past the return stroke until it lifts: a window merged or cut then has no
  // Drain behind it, and every session-backed step would download Claude Code to be refused again. It is marked on the
  // Newest window, so that is the one whose comments are read
  const newestWindow = getNewestWindowPullRequest(windowHistory);
  const sessionLimitResetMs =
    newestWindow &&
    readSessionLimitResetMs(readEntries<GitHubEntry>(`issues/${newestWindow.number}/comments`), viewerLogin);
  if (sessionLimitResetMs !== undefined && sessionLimitResetMs > Date.now())
    return getOutcome(
      CycleOutcomeKind.Idle,
      `the session is limited until ${new Date(sessionLimitResetMs).toISOString()} — nothing merges or ports until a session can follow it`,
      getRetriggerDelaySeconds(sessionLimitResetMs - Date.now() + RETRIGGER_BUFFER_MS),
    );
  // The express lane, before the stack is looked at: a commit claiming no review reaches `main` directly and the fold
  // Carries it to `develop` with the next window — and a red `main` its cut cannot pass is repaired by the lane's own cut
  const expressed = await runExpressLane({ collectorSha, cwd, developSha, isDryRun, mainSha, queueSha, viewerLogin });
  if (expressed.outcome) return expressed.outcome;
  // A window closed without merging is a person's pause, as a closed release was: opening another over it would spend
  // The slot they were withholding
  const pausedWindow = getPausedWindow(windowHistory, openPullRequests);
  if (pausedWindow)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${pausedWindow.number} was closed without merging — a person's pause, re-open it to resume`,
    );
  // The release before the stack is a pause too when a person closed it
  if (legacyPullRequest?.state === WindowPullRequestState.Closed)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${legacyPullRequest.number} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} was closed without merging — a person's pause`,
    );

  // The newest merged pull request is the review the next cut answers, so its findings are drained again on every run
  // Until none is open. A drain that left one ended the run that merged it, so nothing above it may merge or open first
  let reviewFixesSha = branchShas.reviewFixesSha;
  const pendingPullRequest = getNewestMergedPullRequest([
    ...windowHistory,
    ...(legacyPullRequest ? [legacyPullRequest] : []),
  ]);
  const drainedBeforeWalk = pendingPullRequest === undefined ? [] : [pendingPullRequest];
  if (pendingPullRequest !== undefined) {
    const pending = await drainWindow({
      collectorSha,
      cwd,
      developSha,
      isDryRun,
      mainSha,
      pullRequest: pendingPullRequest,
      queueSha,
      reviewFixesSha,
      viewerLogin,
    });
    if (pending.outcome) return pending.outcome;
    reviewFixesSha = pending.reviewFixesSha;
  }

  // Bottom up, the stack is walked: the bottom merges and is drained once its review completes, a window above an
  // Unmerged one waits, and a rate limit is settled wherever it refused a review
  const stack = orderWindowStack(stackPullRequests);
  const walked = await walkWindowStack({
    collectorSha,
    cwd,
    developSha,
    isDryRun,
    queueSha,
    reviewFixesSha,
    stack,
    viewerLogin,
  });
  if (walked.outcome)
    return getOutcome(
      walked.outcome.kind,
      walked.outcome.reason,
      walked.retriggerDelaySeconds,
      walked.outcome.targetSha,
    );
  const drainedPullRequests = [...drainedBeforeWalk, ...walked.drainedPullRequests];
  // A named pull request is drained when no window is open, as the merged release was: its findings lead the next cut
  if (namedPullRequest !== undefined && stack.length === 0) {
    const currentShas = readBranchShas(cwd);
    const drain = await drainWindow({
      collectorSha,
      cwd,
      developSha,
      isDryRun,
      mainSha: currentShas.mainSha,
      pullRequest: namedPullRequest,
      queueSha: currentShas.queueSha,
      reviewFixesSha: currentShas.reviewFixesSha,
      viewerLogin,
    });
    if (drain.outcome)
      return getOutcome(
        drain.outcome.kind,
        drain.outcome.reason,
        getSoonestDelay(walked.retriggerDelaySeconds, drain.outcome.retriggerDelaySeconds),
        drain.outcome.targetSha,
      );
    drainedPullRequests.push(namedPullRequest);
  }

  // A window cut over `develop` while the release is open would move that pull request's head under its own review, so
  // No window opens until the walk has merged it. Once merged, `main` has moved past `develop` and the stroke follows it
  // Before a window is cut, as the next run's would
  if (
    legacyPullRequest?.state === WindowPullRequestState.Open &&
    !walked.drainedPullRequests.includes(legacyPullRequest.number)
  )
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${legacyPullRequest.number} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} is open — no window opens until its review completes and it merges`,
      walked.retriggerDelaySeconds,
    );

  // The windows: one at a time, for as long as the hourly ceiling and the stacking guard allow. A window that did not
  // Reach the remote ends the openings, and what the openings returned is the run's verdict
  let openedStack = orderWindowStack(readWindowPullRequests(WindowPullRequestListState.Open));
  if (walked.drainedPullRequests.length > 0) {
    // The walk merged something, so the stroke is asked again: it moves `develop` only once the stack is empty
    const currentShas = readBranchShas(cwd);
    const followed = runReturnStroke({
      cwd,
      developSha: currentShas.developSha,
      isDryRun,
      isStackOpen: openedStack.length > 0,
      mainSha: currentShas.mainSha,
    });
    if (followed.outcome)
      return getOutcome(
        followed.outcome.kind,
        followed.outcome.reason,
        walked.retriggerDelaySeconds,
        followed.outcome.targetSha,
      );
  }
  let history = readWindowPullRequests(WindowPullRequestListState.All);
  let openingOutcome: CycleOutcome | undefined;
  while (
    getWindowOpenCount({
      isStackingAllowed: checkIsStackingAllowedOver(openedStack, cwd),
      openCount: openedStack.length,
      openedInLastHour: getOpenedInLastHour(history, Date.now()),
      reviewsPerHour: REVIEWS_PER_HOUR,
    }) > 0
  ) {
    // A pull request drained by an earlier run that opened nothing is answered by this cut too
    const previousWindow = getNewestWindowPullRequest(history);
    const answeredPullRequests = [
      ...new Set([
        ...drainedPullRequests,
        ...(previousWindow ? readMergedPullRequestsSince(previousWindow.createdAt) : []),
      ]),
    ];
    // oxlint-disable-next-line no-await-in-loop -- each window is cut from the remote the one before it moved
    const opened = await openNextWindow({
      collectorSha,
      cwd,
      drainedPullRequests: answeredPullRequests,
      expressHeldCount: expressed.heldShas.length,
      fileCap: REVIEW_FILE_CAP,
      isDryRun,
      openPullRequests: openedStack,
      viewerLogin,
      windowNumber: getNextWindowNumber(history),
    });
    if (!opened.isWindowOpened) {
      openingOutcome ??= opened.outcome;
      break;
    }
    openingOutcome = opened.outcome;
    // A dry run moves nothing, so the window it would open is the same one again: it is reported once
    if (isDryRun) break;
    openedStack = orderWindowStack(readWindowPullRequests(WindowPullRequestListState.Open));
    history = readWindowPullRequests(WindowPullRequestListState.All);
  }

  // The ceiling counts openings by when they were made, so it turns over on the clock with no event behind it: while it
  // Is what keeps the stack below the plan's figure, the run wakes again once the oldest opening ages out of the hour
  const nowMs = Date.now();
  const ceilingDelaySeconds =
    getOpenedInLastHour(history, nowMs) >= REVIEWS_PER_HOUR && openedStack.length < REVIEWS_PER_HOUR
      ? getRetriggerDelaySeconds(getOpeningWaitMs(history, nowMs) + RETRIGGER_BUFFER_MS)
      : undefined;
  const retriggerDelaySeconds = getSoonestDelay(walked.retriggerDelaySeconds, ceilingDelaySeconds);
  if (openingOutcome === undefined || openingOutcome.kind === CycleOutcomeKind.Idle) {
    const idleReasons = [...walked.blockReasons, ...(openingOutcome === undefined ? [] : [openingOutcome.reason])];
    return getOutcome(
      CycleOutcomeKind.Idle,
      idleReasons.join("; ") ||
        `no window opens — the hourly ceiling or the stacking guard holds for ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds,
    );
  }
  return getOutcome(openingOutcome.kind, openingOutcome.reason, retriggerDelaySeconds, openingOutcome.targetSha);
};
