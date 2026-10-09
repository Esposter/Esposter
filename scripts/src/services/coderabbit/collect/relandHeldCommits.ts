import type { RelandInput } from "#src/models/coderabbit/collect/RelandInput";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { closeHeldIssue } from "#src/services/coderabbit/collect/closeHeldIssue";
import {
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

// Parked commits come back on their own. What held each one — a conflict with the tree the queue was built on, a
// `main` its claim or its window would not apply to, a room too small beside the fixes — changes when `main` moves,
// Which every window merge does, so each held commit is picked back onto the queue's head once per `main` head. The
// Heads are recorded on the commit itself: the one a run first finds it held at, which is the head it was parked at or
// One soon after and is never tried, and every head a re-land was tried at. A conflict goes to the sync's resolver
// (`relandHeldCommit`), one session per run at most, so the windows' own work never queues behind a backlog of them.
// A re-land that lands is pushed onto the queue under the lease its rewrites use, its held branch deleted and its issue
// Closed once every branch the issue lists is gone, and a re-landed fix is replied for on the windows it answers; one
// That fails is counted on the commit and kept for the next head. Past the attempt cap a commit waits for a change to
// The collector's own source, as every capped step does, and so does one re-landed that many times already, since
// Each copy parked again is a new commit whose own counts start afresh. One over the plan's cap alone never comes back
// This way: only a reshaping carries it, and that is what failed.
export const relandHeldCommits = async ({ collectorSha, cwd, isDryRun, viewerLogin }: RelandInput): Promise<void> => {
  const heldCommits = readHeldCommits(cwd);
  if (heldCommits.length === 0) return;

  const branchShas = readBranchShas(cwd);
  const { mainSha } = branchShas;
  let { queueSha } = branchShas;
  const heldBranches = new Set(heldCommits.map(({ branch }) => branch));
  for (const { branch, sha } of heldCommits) {
    const headMarker = getMarker(RELAND_MARKER, sha, [mainSha]);
    const { attempts, comments, recordFailure } = readCommitAttempts({
      collectorSha,
      marker: RELAND_FAILED_MARKER,
      sha,
      viewerLogin,
    });
    // The marker with no head says a run has seen the commit held, and names the head it saw it at beside it
    const seenMarker = getMarker(RELAND_MARKER, sha);
    const isSeen = comments.some((comment) => checkIsMarked(comment, viewerLogin, seenMarker));
    if (!isSeen && !isDryRun)
      postCommitComment(
        sha,
        `${seenMarker}\n${headMarker}\nHeld while \`${MAIN_BRANCH}\` is at ${mainSha}: the collector tries its re-land once \`${MAIN_BRANCH}\` moves.`,
      );
    if (
      !isSeen ||
      attempts >= SESSION_ATTEMPT_CAP ||
      comments.some((comment) => checkIsMarked(comment, viewerLogin, headMarker)) ||
      getTrailerValues(runGit(["log", "-1", "--format=%B", sha], cwd), RELANDED_TRAILER).length >=
        SESSION_ATTEMPT_CAP ||
      readReviewedFilePaths(mainSha, `${sha}^..${sha}`, cwd).length > REVIEW_FILE_CAP
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
      if (pushedSha === undefined) return;
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
    }
    if (isSessionRun) return;
  }
};
