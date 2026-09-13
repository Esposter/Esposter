import type { PullRequestComment } from "#src/models/coderabbit/collect/PullRequestComment";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { checkHasMarkerComment, getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { readAnsweredCommits } from "#src/services/coderabbit/collect/readAnsweredCommits";
import { readEntries } from "#src/services/coderabbit/collect/readEntries";
import { runGh } from "#src/services/coderabbit/shared/runGh";

// Every commit in the range that answers a finding gets its reply — the one the skill says cites a sha the
// Remote has. Predicate-guarded per thread, so the run that pushed and died before replying is finished by any
// Later run, and a run that finds every reply in place posts nothing.
export const replyAnswered = (pullRequest: number, range: string, viewerLogin: string, isDryRun: boolean): void => {
  const commits = readAnsweredCommits(range);
  if (commits.length === 0) return;

  const repliesByParent = Map.groupBy(
    readEntries<PullRequestComment>(`pulls/${pullRequest.toString()}/comments`).filter(
      ({ in_reply_to_id }) => in_reply_to_id !== undefined,
    ),
    ({ in_reply_to_id }) => in_reply_to_id,
  );
  const issueComments = readEntries<GitHubEntry>(`issues/${pullRequest.toString()}/comments`);

  for (const { answers, sha, subject } of commits)
    for (const commentId of answers) {
      const replies = repliesByParent.get(commentId) ?? [];
      if (replies.some(({ body, user }) => user.login === viewerLogin && body.includes(sha))) continue;

      const body = `Agreed, fixed in ${sha} — ${subject}`;
      console.info(`reply ${commentId.toString()}: ${body}`);
      if (!isDryRun)
        runGh([
          "api",
          `repos/{owner}/{repo}/pulls/${pullRequest.toString()}/comments/${commentId.toString()}/replies`,
          "-f",
          `body=${body}`,
        ]);
    }

  const commitsByReview = Map.groupBy(
    commits.flatMap((commit) => commit.drains.map((reviewId) => ({ commit, reviewId }))),
    ({ reviewId }) => reviewId,
  );
  for (const [reviewId, drained] of commitsByReview) {
    const marker = getMarker(DRAINS_MARKER, reviewId);
    if (checkHasMarkerComment(issueComments, viewerLogin, marker)) continue;

    const lines = drained.map(({ commit }) => `- ${commit.sha} — ${commit.subject}`);
    const body = `${marker}\nBody-only findings of review ${reviewId.toString()} are answered by:\n${lines.join("\n")}`;
    console.info(`verdict comment for review ${reviewId.toString()}`);
    if (!isDryRun) runGh(["pr", "comment", pullRequest.toString(), "--body", body]);
  }
};
