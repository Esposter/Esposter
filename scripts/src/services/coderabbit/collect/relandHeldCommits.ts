import type { RelandInput } from "#src/models/coderabbit/collect/RelandInput";
import type { RelandResult } from "#src/models/coderabbit/collect/RelandResult";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { closeHeldIssue } from "#src/services/coderabbit/collect/closeHeldIssue";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RELAND_FAILED_MARKER,
  RELAND_MARKER,
  RELANDED_TRAILER,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { markFoldedWindowsMerged } from "#src/services/coderabbit/collect/markFoldedWindowsMerged";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushQueueRewrite } from "#src/services/coderabbit/collect/pushQueueRewrite";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readHeldCommits } from "#src/services/coderabbit/collect/readHeldCommits";
import { readReviewedFilePaths } from "#src/services/coderabbit/collect/readReviewedFilePaths";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { relandHeldCommit } from "#src/services/coderabbit/collect/relandHeldCommit";
import { replyRelandedAnswers } from "#src/services/coderabbit/collect/replyRelandedAnswers";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Parked commits come back on their own. What held each one — a conflict with the tree the queue was built on, a `main`
// Its claim or its window would not apply to, a room too small beside the fixes — changes when `main` moves, which
// Every window merge does, so each held commit is picked back onto the queue's head once per `main` head. The first run
// To find it held — the run that parked it, or one soon after — only records that it has, and wakes the run after it,
// Which tries the re-land at that same head: in a quiet queue `main` may not move again for hours, and a commit tried
// Only once it did would wait on work nobody is sending. Every head a re-land was tried at is recorded on the commit
// Itself. A conflict goes to the sync's resolver (`relandHeldCommit`), one session per run at most, so the windows' own
// Work never queues behind a backlog of them, and a run that stops on one wakes the next for the commits behind it. A
// Re-land that lands is pushed onto the queue under the lease its rewrites use, its held branch deleted and its issue
// Closed once every branch the issue lists is gone, and a re-landed fix is replied for on the windows it answers; one
// That fails is counted on the commit and kept for the next head. Past the attempt cap a commit waits for a change to
// The collector's own source, as every capped step does, and so does one re-landed that many times already, since each
// Copy parked again is a new commit whose own counts start afresh. One over the plan's cap alone never comes back this
// Way: only a reshaping carries it, and that is what failed. Nor does one the queue still holds itself — a claim the
// Express lane parked with no rewrite since — until the queue's next rewrite drops it: picked onto a queue that holds
// It, it would come back as the claim no cut applied, never the copy without it that a window carries.
export const relandHeldCommits = async ({
  collectorSha,
  cwd,
  isDryRun,
  viewerLogin,
}: RelandInput): Promise<RelandResult> => {
  const heldCommits = readHeldCommits(cwd);
  if (heldCommits.length === 0) return {};

  const branchShas = readBranchShas(cwd);
  const { mainSha } = branchShas;
  let { queueSha } = branchShas;
  const heldBranches = new Set(heldCommits.map(({ branch }) => branch));
  let retriggerDelaySeconds: number | undefined;
  for (const [index, { branch, sha }] of heldCommits.entries()) {
    const headMarker = getMarker(RELAND_MARKER, sha, [mainSha]);
    const { attempts, comments, recordFailure } = readCommitAttempts({
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
        `${seenMarker}\nHeld while \`${MAIN_BRANCH}\` is at ${mainSha}: the collector tries its re-land on its next run, and again each time \`${MAIN_BRANCH}\` moves.`,
      );
      retriggerDelaySeconds = ATTEMPT_RETRY_DELAY_SECONDS;
    }
    if (
      !isSeen ||
      attempts >= SESSION_ATTEMPT_CAP ||
      comments.some((comment) => checkIsMarked(comment, viewerLogin, headMarker)) ||
      getTrailerValues(runGit(["log", "-1", "--format=%B", sha], cwd), RELANDED_TRAILER).length >=
        SESSION_ATTEMPT_CAP ||
      readReviewedFilePaths(mainSha, `${sha}^..${sha}`, cwd).length > REVIEW_FILE_CAP ||
      checkIsAncestor(sha, queueSha, cwd)
    )
      continue;
    else if (isDryRun) {
      console.info(`reland: would pick ${sha} from ${branch} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha}`);
      continue;
    }

    // oxlint-disable-next-line no-await-in-loop -- each re-land is picked onto the queue the one before it pushed
    const { failure, isSessionRun } = await relandHeldCommit({ branch, cwd, queueSha, sha });
    if (failure === undefined) {
      const relandedSha = readHeadSha(cwd);
      const isCarried = relandedSha === queueSha;
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
      getResult(() => runGit(["push", "origin", "--delete", branch], cwd)).match(noop, console.error);
      heldBranches.delete(branch);
      closeHeldIssue({ branch, heldBranches, note, viewerLogin });
    } else {
      console.info(`reland: ${sha} from ${branch} — ${failure}`);
      postCommitComment(
        sha,
        `${headMarker}\nTried at \`${MAIN_BRANCH}\` ${mainSha} — ${failure}; the next head tries again.`,
      );
      recordFailure(`re-land ${sha} onto ${QUEUE_BRANCH} at ${MAIN_BRANCH} ${mainSha}`);
      // The commits behind a session that failed are owed their try at this head, and no push fires the run for them
      if (isSessionRun && index < heldCommits.length - 1) retriggerDelaySeconds = ATTEMPT_RETRY_DELAY_SECONDS;
    }
    if (isSessionRun) return { retriggerDelaySeconds };
  }
  return { retriggerDelaySeconds };
};
