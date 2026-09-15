import type { PullRequestComment } from "#src/models/coderabbit/collect/PullRequestComment";
import type { ReplyAnsweredInput } from "#src/models/coderabbit/collect/ReplyAnsweredInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { getDrainsVerdictBody } from "#src/services/coderabbit/collect/getDrainsVerdictBody";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postReply } from "#src/services/coderabbit/collect/postReply";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { getResult, noop } from "@esposter/shared";

// Every commit in the range that answers a finding gets the reply citing its sha. Predicate-guarded per thread,
// So a run that pushed and died before replying is finished by a later one. Each post is best-effort: GitHub
// Answers 500 on a thread often enough, and the predicate re-attempts it next run.
export const replyAnswered = ({
  commits,
  isDryRun,
  issueComments,
  pullRequest,
  viewerLogin,
}: ReplyAnsweredInput): void => {
  if (commits.length === 0) return;

  const repliesByParent = Map.groupBy(
    readEntries<PullRequestComment>(`pulls/${pullRequest}/comments`).filter(
      ({ in_reply_to_id }) => in_reply_to_id !== undefined,
    ),
    ({ in_reply_to_id }) => in_reply_to_id,
  );
  for (const { answers, sha, subject } of commits)
    for (const commentId of answers) {
      const replies = repliesByParent.get(commentId) ?? [];
      if (replies.some((reply) => checkIsMarked(reply, viewerLogin, sha))) continue;

      const body = `Agreed, fixed in ${sha} — ${subject}`;
      console.info(`reply ${commentId}: ${body}`);
      if (!isDryRun) getResult(() => postReply(pullRequest, commentId, body)).match(noop, console.error);
    }

  // The predicate is the marker and the shas together: the rejections comment carries the marker and none of
  // These commits, so a review partly rejected and partly fixed owes both
  const commitsByReview = Map.groupBy(
    commits.flatMap((commit) => commit.drains.map((reviewId) => ({ commit, reviewId }))),
    ({ reviewId }) => reviewId,
  );
  for (const [reviewId, drained] of commitsByReview) {
    const marker = getMarker(DRAINS_MARKER, reviewId);
    const shas = drained.map(({ commit }) => commit.sha);
    if (
      issueComments.some(
        (comment) => checkIsMarked(comment, viewerLogin, marker) && shas.every((sha) => comment.body.includes(sha)),
      )
    )
      continue;

    const body = getDrainsVerdictBody(
      reviewId,
      "answered by",
      drained.map(({ commit }) => `- ${commit.sha} — ${commit.subject}`),
    );
    console.info(`verdict comment for review ${reviewId}`);
    if (!isDryRun) getResult(() => postComment(pullRequest, body)).match(noop, console.error);
  }
};
