import type { PullRequestComment } from "#src/models/coderabbit/collect/PullRequestComment";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkHasMarkerComment, getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
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
export const replyAnswered = (pullRequest: number, range: string, viewerLogin: string, isDryRun: boolean): void => {
  const commits = readAnsweredCommits(range);
  if (commits.length === 0) return;

  const repliesByParent = Map.groupBy(
    readEntries<PullRequestComment>(`pulls/${pullRequest}/comments`).filter(
      ({ in_reply_to_id }) => in_reply_to_id !== undefined,
    ),
    ({ in_reply_to_id }) => in_reply_to_id,
  );
  const issueComments = readEntries<GitHubEntry>(`issues/${pullRequest}/comments`);

  for (const { answers, sha, subject } of commits)
    for (const commentId of answers) {
      const replies = repliesByParent.get(commentId) ?? [];
      if (replies.some(({ body, user }) => user.login === viewerLogin && body.includes(sha))) continue;

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

  const commitsByReview = Map.groupBy(
    commits.flatMap((commit) => commit.drains.map((reviewId) => ({ commit, reviewId }))),
    ({ reviewId }) => reviewId,
  );
  for (const [reviewId, drained] of commitsByReview) {
    const marker = getMarker(DRAINS_MARKER, reviewId);
    if (checkHasMarkerComment(issueComments, viewerLogin, marker)) continue;

    const lines = drained.map(({ commit }) => `- ${commit.sha} — ${commit.subject}`);
    const body = `${marker}\nBody-only findings of review ${reviewId} are answered by:\n${lines.join("\n")}`;
    console.info(`verdict comment for review ${reviewId}`);
    if (!isDryRun)
      getResult(() => runGh(["pr", "comment", pullRequest.toString(), "--body", body])).orTee(console.error);
  }
};
