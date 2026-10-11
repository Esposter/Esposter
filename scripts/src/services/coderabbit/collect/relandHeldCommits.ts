import type { RelandInput } from "#src/models/coderabbit/collect/RelandInput";
import type { RelandResult } from "#src/models/coderabbit/collect/RelandResult";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RELAND_FAILED_MARKER,
  RELAND_MARKER,
  RELAND_RETRY_WAITS_MS,
  RELANDED_TRAILER,
  RETRIGGER_BUFFER_MS,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getSoonestDelay } from "#src/services/coderabbit/collect/getSoonestDelay";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { markFoldedWindowsMerged } from "#src/services/coderabbit/collect/markFoldedWindowsMerged";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushQueueRewrite } from "#src/services/coderabbit/collect/pushQueueRewrite";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readHeldCommits } from "#src/services/coderabbit/collect/readHeldCommits";
import { readReviewedFilePaths } from "#src/services/coderabbit/collect/readReviewedFilePaths";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { relandHeldCommit } from "#src/services/coderabbit/collect/relandHeldCommit";
import { releaseHeldBranch } from "#src/services/coderabbit/collect/releaseHeldBranch";
import { replyRelandedAnswers } from "#src/services/coderabbit/collect/replyRelandedAnswers";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// The wait after a held commit's `attempts`-th re-land at one `main` head, before that head is tried again
const getRetryWaitMs = (attempts: number): number =>
  takeOne(RELAND_RETRY_WAITS_MS, Math.min(attempts, RELAND_RETRY_WAITS_MS.length) - 1);
// Parked commits come back on their own. What held each one — a conflict with the tree the queue was built on, a `main`
// Its claim or its window would not apply to, a room too small beside the fixes — changes when `main` moves, which
// Every window merge does, so each held commit is tried once at every `main` head. The first run to find it held — the
// Run that parked it, or one soon after — only records that it has, and wakes the run after it, which tries that same
// Head: in a quiet queue `main` may not move again for hours, and a commit tried only once it did would wait on work
// Nobody is sending. For the same reason a head already tried is tried again once the wait after its last try passes
// (`RELAND_RETRY_WAITS_MS`), each wait slept out by the retrigger, so the attempts are spent with `main` still. Every head
// A re-land was tried at is recorded on the commit itself, and so is every try against the attempt cap.
//
// A commit the queue or the fixes still carry themselves — a claim the express lane parked, the port's leftover, a fix
// `ai/review-fixes` holds — is no pick: picked onto a queue that holds it, it would come back as the commit that was
// Parked. It is let go instead, its held branch deleted so it is owed again, and the paths that parked it — the express
// Lane, the sync, the port — try it again under their own caps; one they park again comes back here, its try counted.
// A claim the lane parks again after its let-go is no longer the lane's: its copy without the claim takes its place in
// The queue (`relandHeldCommit`), so a window carries it rather than the cap being spent on a lane it failed twice.
// Any other is picked onto the queue's head, a conflict going to the sync's resolver (`relandHeldCommit`), one session
// Per run at most, so the windows' own work never queues behind a backlog of them, and a run that stops on one wakes the
// Next for the commits behind it. A re-land that lands is pushed onto the queue under the lease its rewrites use, its held
// Branch deleted and its issue closed once every branch the issue lists is gone, and a re-landed fix is replied for on
// The windows it answers. Past the attempt cap a commit waits for a change to the collector's own source, as every
// Capped step does, and so does one re-landed that many times already, since each copy parked again is a new commit
// Whose own counts start afresh. One over the plan's cap alone never comes back this way: only a reshaping carries it,
// And that is what failed.
export const relandHeldCommits = async ({
  collectorSha,
  cwd,
  isDryRun,
  viewerLogin,
}: RelandInput): Promise<RelandResult> => {
  const heldCommits = readHeldCommits(cwd);
  if (heldCommits.length === 0) return {};

  const branchShas = readBranchShas(cwd);
  const { mainSha, reviewFixesSha } = branchShas;
  let { queueSha } = branchShas;
  const heldBranches = new Set(heldCommits.map(({ branch }) => branch));
  let retriggerDelaySeconds: number | undefined;
  // Each commit's hold states its own wake, and the run sleeps out the soonest
  const wake = (delaySeconds: number): void => {
    retriggerDelaySeconds = getSoonestDelay(retriggerDelaySeconds, delaySeconds);
  };
  for (const [index, { branch, sha }] of heldCommits.entries()) {
    const headMarker = getMarker(RELAND_MARKER, sha, [mainSha]);
    const { attemptedAtMs, attempts, comments, recordAttempt, recordFailure } = readCommitAttempts({
      collectorSha,
      marker: RELAND_FAILED_MARKER,
      sha,
      viewerLogin,
    });
    // The marker with no head says a run has seen the commit held
    const seenMarker = getMarker(RELAND_MARKER, sha);
    const isSeen = comments.some((comment) => checkIsMarked(comment, viewerLogin, seenMarker));
    if (!isSeen && !isDryRun) {
      postCommitComment(
        sha,
        `${seenMarker}\nHeld while \`${MAIN_BRANCH}\` is at ${mainSha}: the collector tries its re-land on its next run, then each time \`${MAIN_BRANCH}\` moves or the wait after a failed try passes, up to ${SESSION_ATTEMPT_CAP} tries.`,
      );
      wake(ATTEMPT_RETRY_DELAY_SECONDS);
    }
    const body = runGit(["log", "-1", "--format=%B", sha], cwd);
    if (
      !isSeen ||
      attempts >= SESSION_ATTEMPT_CAP ||
      getTrailerValues(body, RELANDED_TRAILER).length >= SESSION_ATTEMPT_CAP ||
      readReviewedFilePaths(mainSha, `${sha}^..${sha}`, cwd).length > REVIEW_FILE_CAP
    )
      continue;
    // A head not yet tried is tried at once, and so is one whose tries a change to the collector's source left uncounted
    const lastAttemptedAtMs = attemptedAtMs.at(-1);
    const waitMs =
      lastAttemptedAtMs === undefined || !comments.some((comment) => checkIsMarked(comment, viewerLogin, headMarker))
        ? 0
        : lastAttemptedAtMs + getRetryWaitMs(attempts) - Date.now();
    if (waitMs > 0) {
      wake(getRetriggerDelaySeconds(waitMs + RETRIGGER_BUFFER_MS));
      continue;
    }

    const isQueueCarried = checkIsAncestor(sha, queueSha, cwd);
    // A carried commit's tries are its let-gos, since it is never picked: a claim with one has failed the lane since
    const isRerouted = isQueueCarried && attempts > 0 && getTrailerValues(body, EXPRESS_TRAILER).length > 0;
    const isStillCarried =
      !isRerouted && (isQueueCarried || (reviewFixesSha !== undefined && checkIsAncestor(sha, reviewFixesSha, cwd)));
    if (isDryRun) {
      console.info(
        isStillCarried
          ? `reland: would let go of ${sha} on ${branch}, still carried, at ${MAIN_BRANCH} ${mainSha}`
          : `reland: would pick ${sha} from ${branch} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha}`,
      );
      continue;
    } else if (isStillCarried) {
      // Counted before the branch goes, so a commit the paths park again is never let go without a try spent on it
      postCommitComment(
        sha,
        `${headMarker}\nLet go at \`${MAIN_BRANCH}\` ${mainSha}, since \`${QUEUE_BRANCH}\` or \`${REVIEW_FIXES_BRANCH}\` still carries it: the paths that parked it try it again under their own caps.`,
      );
      recordAttempt(`let go of ${sha} at ${MAIN_BRANCH} ${mainSha}, for the paths that parked it to try again`);
      const note = `${sha} is owed again at \`${MAIN_BRANCH}\` ${mainSha}: the paths that parked it try it again`;
      console.info(`reland: ${note}`);
      releaseHeldBranch({ branch, cwd, heldBranches, note, viewerLogin });
      // A deleted branch fires no run, and the paths that try it again run only in one
      wake(ATTEMPT_RETRY_DELAY_SECONDS);
      continue;
    }

    // oxlint-disable-next-line no-await-in-loop -- each re-land is picked onto the queue the one before it pushed
    const { failure, isSessionRun, relandedSha } = await relandHeldCommit({
      branch,
      cwd,
      isInPlace: isRerouted,
      queueSha,
      sha,
    });
    if (failure === undefined) {
      const isCarried = relandedSha === undefined;
      const pushedSha = isCarried ? queueSha : pushQueueRewrite({ cwd, isDryRun, queueSha, viewerLogin });
      // The queue's history was rewritten under the run: that push fires a run of its own, which picks the commit again
      if (pushedSha === undefined) return { retriggerDelaySeconds };
      queueSha = pushedSha;
      const note = isCarried
        ? `${sha} is already carried by \`${QUEUE_BRANCH}\` at ${queueSha}`
        : `${sha} was re-landed onto \`${QUEUE_BRANCH}\` as ${relandedSha}`;
      console.info(`reland: ${note}`);
      const [relandedCommit] = isCarried ? [] : readAnsweredCommits(["--no-walk", relandedSha], cwd);
      if (relandedCommit)
        replyRelandedAnswers({
          commit: relandedCommit,
          isDryRun,
          viewerLogin,
          windowHistory: markFoldedWindowsMerged(readWindowPullRequests(WindowPullRequestListState.All), mainSha, cwd),
        });
      releaseHeldBranch({ branch, cwd, heldBranches, note, viewerLogin });
    } else {
      console.info(`reland: ${sha} from ${branch} — ${failure}`);
      const isRetried = attempts + 1 < SESSION_ATTEMPT_CAP;
      const retryWaitMs = getRetryWaitMs(attempts + 1);
      postCommitComment(
        sha,
        `${headMarker}\nTried at \`${MAIN_BRANCH}\` ${mainSha} — ${failure}; ${isRetried ? `the next head tries again, and this one at ${new Date(Date.now() + retryWaitMs).toISOString()}` : "its attempts are spent, so it stays held"}.`,
      );
      recordFailure(`re-land ${sha} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha}`);
      if (isRetried) wake(getRetriggerDelaySeconds(retryWaitMs + RETRIGGER_BUFFER_MS));
      // The commits behind a session that failed are owed their try at this head, and no push fires the run for them
      if (isSessionRun && index < heldCommits.length - 1) wake(ATTEMPT_RETRY_DELAY_SECONDS);
    }
    if (isSessionRun) return { retriggerDelaySeconds };
  }
  return { retriggerDelaySeconds };
};
