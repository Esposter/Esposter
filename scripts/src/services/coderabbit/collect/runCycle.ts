import type { CycleInput } from "#src/models/coderabbit/collect/CycleInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { GateDecisionKind } from "#src/models/coderabbit/collect/GateDecisionKind";
import { checkIsRetriggerAsked } from "#src/services/coderabbit/collect/checkIsRetriggerAsked";
import { checkIsSlotFree } from "#src/services/coderabbit/collect/checkIsSlotFree";
import {
  DEVELOP_BRANCH,
  EXPRESS_VERIFY_COMMANDS,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RETRIGGER_SLEEP_CAP_MS,
  REVIEW_FIXES_BRANCH,
} from "#src/services/coderabbit/collect/constants";
import { cutCandidate } from "#src/services/coderabbit/collect/cutCandidate";
import { drainFindings } from "#src/services/coderabbit/collect/drainFindings";
import { getGateDecision } from "#src/services/coderabbit/collect/getGateDecision";
import { getIsReady } from "#src/services/coderabbit/collect/getIsReady";
import { getOpenBodyReviewId } from "#src/services/coderabbit/collect/getOpenBodyReviewId";
import { getOpenFindings } from "#src/services/coderabbit/collect/getOpenFindings";
import { getRateLimitWaitMs } from "#src/services/coderabbit/collect/getRateLimitWaitMs";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { portWindow } from "#src/services/coderabbit/collect/portWindow";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readCheckStatus } from "#src/services/coderabbit/collect/readCheckStatus";
import { readDrainLimitResetMs } from "#src/services/coderabbit/collect/readDrainLimitResetMs";
import { readOpenPullRequest } from "#src/services/coderabbit/collect/readOpenPullRequest";
import { readViewerLogin } from "#src/services/coderabbit/collect/readViewerLogin";
import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { verifyCandidate } from "#src/services/coderabbit/collect/verifyCandidate";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGh } from "#src/services/coderabbit/shared/runGh";
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
    console.info(`${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it`);
    pushBranch({ branch: DEVELOP_BRANCH, isDryRun, sha: mainSha });
  }
  const developSha = isDevelopBehindMain ? mainSha : pushedDevelopSha;

  // The express lane, before the pull request is even looked up: it spends no review slot and needs no pull
  // Request open, which also makes it the one thing that moves the pipeline while there is none. A mechanical
  // Commit reaches `main` directly and the return stroke carries it to `develop` on the next run.
  const express = portExpress({ cwd, developSha, mainSha, queueSha });
  if (express.targetSha !== undefined) {
    console.info(`express: ${express.shas.length.toString()} mechanical commits, nothing in them to review`);
    if (isDryRun)
      return getOutcome(CycleOutcomeKind.Expressed, `would verify and push to ${MAIN_BRANCH}`, express.targetSha);
    // `main` is production and CI is the only gate these commits get, so the cut earns the checks CI would fail
    // It on — the tests among them. A red one is not held back: it simply takes the review lane, where a person
    // Reads why.
    else if (verifyCandidate(EXPRESS_VERIFY_COMMANDS, cwd)) {
      runGit(["fetch", "origin", MAIN_BRANCH]);
      if (readSha(`origin/${MAIN_BRANCH}`) !== mainSha)
        return getOutcome(
          CycleOutcomeKind.Idle,
          `${MAIN_BRANCH} moved during the run — nothing pushed, the next run re-measures`,
        );
      pushBranch({ branch: MAIN_BRANCH, cwd, isDryRun, sha: express.targetSha });
      // One irreversible act per run. The push fires the cycle again, which fast-forwards `develop` onto it and
      // Then measures a window against a frontier that has already moved.
      return getOutcome(
        CycleOutcomeKind.Expressed,
        `${express.shas.length.toString()} mechanical commits reached ${MAIN_BRANCH}`,
        express.targetSha,
      );
    } else console.info("the express cut is red — it takes the review lane instead");
  }

  const pullRequest = namedPullRequest ?? readOpenPullRequest()?.number;
  if (pullRequest === undefined)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `no open ${DEVELOP_BRANCH} → ${MAIN_BRANCH} pull request — re-opening one is a human ask`,
    );

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
    `open findings: ${openThreads.length.toString()} inline, body-only review ${openBodyReviewId?.toString() ?? "none"}`,
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
    `window: ${port.fixCount.toString()} fix commits + ${port.queueShas.length.toString()} queue commits = ${port.fileCount.toString()} files${port.heldSha ? `, held from ${port.heldSha}` : ""}`,
  );
  const isReady = getIsReady({
    fileCount: port.fileCount,
    fixCount: port.fixCount,
    isForced,
    isHeld: port.heldSha !== undefined,
    queueCommitCount: port.queueShas.length,
  });
  if (!isReady) {
    // The review a limit refused is owed once nothing can be added to the range, and not before: while a commit
    // Still fits, the limit that skipped this review is exactly what lets the next window grow the same range, and
    // One review then reads the lot. A port that took nothing is that moment — the queue is empty, or every owed
    // Commit overflows the cap from this frontier, and the overflow only clears once a review moves the frontier.
    // Asking any earlier spends the hour on a range still filling; asking never leaves the frontier where it is,
    // Which is a window that can neither grow nor ship.
    //
    // A run that ships a window needs none of this: the push is auto-reviewed, and a limit refusing that one
    // Rewrites the block, which arrives as the event this workflow runs on.
    if (isRateLimited && port.queueShas.length === 0) {
      const waitMs = getRateLimitWaitMs(issueComments, Date.now());
      if (waitMs) {
        // A deadline past the longest sleep one job holds is slept in relays, the dispatched run reading what is left
        retriggerDelaySeconds = Math.ceil(
          Temporal.Duration.from({ milliseconds: Math.min(waitMs, RETRIGGER_SLEEP_CAP_MS) }).total("seconds"),
        );
        console.info(`rate limited — retrigger in ${retriggerDelaySeconds.toString()}s, the deadline the bot stated`);
        // The ask is posted once per block: the bot's answer to it runs this cycle again, and an unguarded ask would
        // Answer that answer with another one
      } else if (checkIsRetriggerAsked(issueComments, viewerLogin))
        console.info("rate limited — the review it refused is already asked for");
      else if (isDryRun)
        return getOutcome(
          CycleOutcomeKind.Idle,
          "would ask for the review the limit refused — a dry run asks for nothing",
        );
      else {
        runGh(["pr", "comment", pullRequest.toString(), "--body", PROBE_COMMENT]);
        return getOutcome(
          CycleOutcomeKind.Idle,
          "asked for the review the limit refused — the bot's answer fires the cycle again",
        );
      }
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
    `cut: ${cut.queueShas.length.toString()} queue commits = ${cutFileCount.toString()} files${cut.isMainMerged ? ", main folded in" : ""}${cut.isMainConflicted ? ", main conflicts outside the lockfile — held for a person" : ""}${cut.isFastForward ? ", fast-forward" : ""}`,
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
      `the green cut is ${cutFileCount.toString()} files with ${cut.queueShas.length.toString()} queue commits — it waits rather than spending a slot`,
    );

  // Compare-and-swap: a fresh fetch, the develop head still the one measured against, no review started meanwhile
  runGit(["fetch", "origin", DEVELOP_BRANCH]);
  if (readSha(`origin/${DEVELOP_BRANCH}`) !== developSha)
    return getOutcome(
      CycleOutcomeKind.Idle,
      `${DEVELOP_BRANCH} moved during the run — nothing pushed, the next run re-measures`,
    );
  if (!checkIsSlotFree(readCheckStatus(pullRequest)))
    return getOutcome(
      CycleOutcomeKind.Idle,
      "a review started during the run, or its status could not be read — nothing pushed",
    );
  pushBranch({ branch: DEVELOP_BRANCH, cwd, isDryRun, sha: cut.targetSha });

  runGit(["fetch", "origin", DEVELOP_BRANCH]);
  replyAnswered(pullRequest, `${developSha}..${cut.targetSha}`, viewerLogin, isDryRun);
  return getOutcome(
    CycleOutcomeKind.Pushed,
    `${cut.queueShas.length.toString()} queue commits and ${port.fixCount.toString()} fix commits reached ${DEVELOP_BRANCH}`,
    cut.targetSha,
  );
};
