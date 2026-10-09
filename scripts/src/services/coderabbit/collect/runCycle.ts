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
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { getWindowOpenCount } from "#src/services/coderabbit/collect/getWindowOpenCount";
import { markFoldedWindowsMerged } from "#src/services/coderabbit/collect/markFoldedWindowsMerged";
import { openNextWindow } from "#src/services/coderabbit/collect/openNextWindow";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCarriedPullRequests } from "#src/services/coderabbit/collect/readCarriedPullRequests";
import { readCoderabbitConfig } from "#src/services/coderabbit/collect/readCoderabbitConfig";
import { readLegacyReleasePullRequest } from "#src/services/coderabbit/collect/readLegacyReleasePullRequest";
import { readMergedPullRequestsSince } from "#src/services/coderabbit/collect/readMergedPullRequestsSince";
import { readRecutComment } from "#src/services/coderabbit/collect/readRecutComment";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { readSessionLimitResetMs } from "#src/services/coderabbit/collect/readSessionLimitResetMs";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { relandHeldCommits } from "#src/services/coderabbit/collect/relandHeldCommits";
import { retargetStrandedWindows } from "#src/services/coderabbit/collect/retargetStrandedWindows";
import { runExpressLane } from "#src/services/coderabbit/collect/runExpressLane";
import { runRepairStep } from "#src/services/coderabbit/collect/runRepairStep";
import { runReturnStroke } from "#src/services/coderabbit/collect/runReturnStroke";
import { settleWindowChain } from "#src/services/coderabbit/collect/settleWindowChain";
import { walkWindowStack } from "#src/services/coderabbit/collect/walkWindowStack";
import { REVIEWS_PER_HOUR } from "#src/services/coderabbit/shared/constants";
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
// The bottom one merged and drained once its review completes — then as many windows opened as the hourly ceiling and
// The stacking guard allow, each cut from the top of the stack, and last the repair of a red `main`, which no window
// Waits on. Every input is a remote fact and every write is either a push or guarded by a predicate a later run
// Re-evaluates, so any event may run this and a run against unchanged state does nothing. It returns its verdict rather
// Than exiting, which is what makes a dry run one mode of the same code path (docs: infra/review-collector).
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
  // Carries it to `develop` with the next window
  const expressed = runExpressLane({ collectorSha, cwd, developSha, isDryRun, mainSha, queueSha, viewerLogin });
  if (expressed.outcome) return expressed.outcome;
  // A window closed without merging is a person's pause, as a closed release was: opening another over it would spend
  // The slot they were withholding. A window a re-cut closed is no pause, since its replacement is owed at once
  const recutFileCaps = readRecutFileCaps(windowHistory, viewerLogin);
  const pausedWindow = getPausedWindow(
    windowHistory.filter(({ number }) => !recutFileCaps.has(number)),
    openPullRequests,
  );
  if (pausedWindow)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${pausedWindow.number} was closed without merging — a person's pause, re-open it to resume`,
    );
  // The release before the stack is a pause too when a person closed it, and no pause when a re-cut did
  if (
    legacyPullRequest?.state === WindowPullRequestState.Closed &&
    readRecutComment(legacyPullRequest.number, viewerLogin) === undefined
  )
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${legacyPullRequest.number} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} was closed without merging — a person's pause`,
    );

  // The newest merged pull request is the review the next cut answers, so its findings are drained again on every run
  // Until none is open. A drain that could not finish ended the run that merged it, so nothing above it may merge or
  // Open first
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
    reviewFixesSha = pending.reviewFixesSha;
  }

  // Bottom up, the stack is walked: the bottom merges and is drained once its review completes, a window above an
  // Unmerged one waits, and a rate limit is settled wherever it refused a review. A window off the chain from `main` is
  // Closed first, for the opener to cut again
  const chain = settleWindowChain({ cwd, isDryRun, stackPullRequests, viewerLogin });
  const { stack } = chain;
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
  // The chain's re-cut is reported and woken for with the walk's holds
  const blockReasons = [...(chain.recut ? [chain.recut.reason] : []), ...walked.blockReasons];
  const walkedRetriggerDelaySeconds = getSoonestDelay(chain.recut?.retriggerDelaySeconds, walked.retriggerDelaySeconds);
  if (walked.outcome)
    return getOutcome(
      walked.outcome.kind,
      walked.outcome.reason,
      walkedRetriggerDelaySeconds,
      walked.outcome.targetSha,
    );
  const drainedPullRequests = [...drainedBeforeWalk, ...walked.drainedPullRequests];
  // A named pull request is drained when no window is open, as the merged release was: its findings lead the next cut
  if (namedPullRequest !== undefined && stack.length === 0) {
    const currentShas = readBranchShas(cwd);
    await drainWindow({
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
    drainedPullRequests.push(namedPullRequest);
  }

  // A window cut over `develop` while the release is open would move that pull request's head under its own review, so
  // No window opens until the walk has merged it, or a re-cut has closed it for the opener to cut its commits again —
  // Read again, since no event follows that close. Once merged, `main` has moved past `develop` and the stroke follows
  // It before a window is cut, as the next run's would
  if (
    legacyPullRequest?.state === WindowPullRequestState.Open &&
    !walked.drainedPullRequests.includes(legacyPullRequest.number) &&
    readLegacyReleasePullRequest()?.state === WindowPullRequestState.Open
  )
    return getOutcome(
      CycleOutcomeKind.Idle,
      `pull request #${legacyPullRequest.number} from ${DEVELOP_BRANCH} to ${MAIN_BRANCH} is open — no window opens until its review completes and it merges`,
      walkedRetriggerDelaySeconds,
    );

  // The windows: one at a time, for as long as the hourly ceiling and the stacking guard allow. A window that did not
  // Reach the remote ends the openings, and what the openings returned is the run's verdict
  let openedStack = orderWindowStack(readWindowPullRequests(WindowPullRequestListState.Open));
  // The stroke is asked again, since the walk may have merged the stack or a re-cut closed it: it moves `develop` only
  // Once the stack is empty
  const walkedShas = readBranchShas(cwd);
  const followed = runReturnStroke({
    cwd,
    developSha: walkedShas.developSha,
    isDryRun,
    isStackOpen: openedStack.length > 0,
    mainSha: walkedShas.mainSha,
  });
  if (followed.outcome)
    return getOutcome(
      followed.outcome.kind,
      followed.outcome.reason,
      getSoonestDelay(walkedRetriggerDelaySeconds, followed.outcome.retriggerDelaySeconds),
      followed.outcome.targetSha,
    );
  let history = readWindowPullRequests(WindowPullRequestListState.All);
  // A re-cut in the walk closed windows whose marker carries the cap their replacement is cut to
  const openingFileCaps = readRecutFileCaps(history, viewerLogin);
  let openingOutcome: CycleOutcome | undefined;
  while (
    getWindowOpenCount({
      isStackingAllowed: checkIsStackingAllowedOver(openedStack, cwd),
      openCount: openedStack.length,
      openedInLastHour: getOpenedInLastHour(history, Date.now()),
      reviewsPerHour: REVIEWS_PER_HOUR,
    }) > 0
  ) {
    // A pull request drained by an earlier run that opened nothing is answered by this cut too, and so are the re-cut
    // Windows each one's drain carried
    const previousWindow = getNewestWindowPullRequest(history);
    const openingHistory = history;
    const repliedPullRequests = [
      ...drainedPullRequests,
      ...(previousWindow ? readMergedPullRequestsSince(previousWindow.createdAt) : []),
    ];
    const answeredPullRequests = [
      ...new Set([
        ...repliedPullRequests,
        ...repliedPullRequests.flatMap((pullRequest) =>
          readCarriedPullRequests(openingHistory, pullRequest, viewerLogin),
        ),
      ]),
    ];
    // oxlint-disable-next-line no-await-in-loop -- each window is cut from the remote the one before it moved
    const opened = await openNextWindow({
      collectorSha,
      cwd,
      drainedPullRequests: answeredPullRequests,
      expressHeldShas: expressed.heldShas,
      expressMainSha: mainSha,
      fileCap: getWindowFileCap(history, openingFileCaps),
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
  // The held commits not yet tried at this `main` head are picked back onto the queue, after the openings so a
  // Resolver's session never holds one; the queue push that lands one fires the run that cuts it, and a re-land left
  // For the next run states its wake
  const relanded = await relandHeldCommits({ collectorSha, cwd, isDryRun, viewerLogin });

  // The ceiling counts openings by when they were made, so it turns over on the clock with no event behind it: while it
  // Holds, the run wakes again once the oldest opening ages out of the hour, however many windows are open then
  const nowMs = Date.now();
  const ceilingDelaySeconds =
    getOpenedInLastHour(history, nowMs) >= REVIEWS_PER_HOUR
      ? getRetriggerDelaySeconds(getOpeningWaitMs(history, nowMs) + RETRIGGER_BUFFER_MS)
      : undefined;
  // A red `main` last, on the remote as the walk and the openings left it: its repair verdict wins, carrying the wake
  // The stack and the openings are owed, and a red held for the queue's run over it or a signature past its repairs
  // States the wake that run concluding, or its oldest attempt ageing out, is owed
  const repaired = await runRepairStep({ collectorSha, cwd, isDryRun, viewerLogin });
  const retriggerDelaySeconds = getSoonestDelay(
    walkedRetriggerDelaySeconds,
    ceilingDelaySeconds,
    openingOutcome?.retriggerDelaySeconds,
    relanded.retriggerDelaySeconds,
    repaired.retriggerDelaySeconds,
  );
  if (repaired.outcome)
    return getOutcome(
      repaired.outcome.kind,
      repaired.outcome.reason,
      retriggerDelaySeconds,
      repaired.outcome.targetSha,
    );
  if (openingOutcome === undefined || openingOutcome.kind === CycleOutcomeKind.Idle) {
    const idleReasons = [...blockReasons, ...(openingOutcome === undefined ? [] : [openingOutcome.reason])];
    return getOutcome(
      CycleOutcomeKind.Idle,
      idleReasons.join("; ") ||
        `no window opens — the hourly ceiling or the stacking guard holds for ${DEVELOP_BRANCH}`,
      retriggerDelaySeconds,
    );
  }
  return getOutcome(openingOutcome.kind, openingOutcome.reason, retriggerDelaySeconds, openingOutcome.targetSha);
};
