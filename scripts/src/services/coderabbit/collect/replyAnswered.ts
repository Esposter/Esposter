import type { PullRequestComment } from "#src/models/coderabbit/collect/PullRequestComment";
import type { ReplyAnsweredInput } from "#src/models/coderabbit/collect/ReplyAnsweredInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { getDrainsVerdictBody } from "#src/services/coderabbit/collect/getDrainsVerdictBody";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { getResult } from "@esposter/shared";

// Every commit in the range that answers a finding gets its reply — the one the skill says cites a sha the
// Remote has. Predicate-guarded per thread, so the run that pushed and died before replying is finished by any
// Later run, and a run that finds every reply in place posts nothing.
//
// Each post is best-effort, because the state it reports is already durable and the reporting is not: GitHub
// Answers 500 with an empty body on a thread often enough to have taken a run down after its window had landed,
// And an exception there ends the run before the replies behind it. The predicate re-attempts every one on the
// Next run, so a transient refusal costs nothing and a lasting one costs a thread rather than the pipeline.
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
      if (!isDryRun)
        getResult(() =>
          runGh([
            "api",
            `repos/{owner}/{repo}/pulls/${pullRequest}/comments/${commentId}/replies`,
            "-f",
            `body=${body}`,
          ]),
        ).orTee(console.error);
    }

  // The predicate is the review's marker and the shas together: the rejections comment the drain's end posted
  // Carries the marker and none of these commits, so a review whose body findings were partly rejected and partly
  // Fixed owes both, and one commit draining two reviews owes a comment per review
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
    if (!isDryRun)
      getResult(() => runGh(["pr", "comment", pullRequest.toString(), "--body", body])).orTee(console.error);
  }
};
