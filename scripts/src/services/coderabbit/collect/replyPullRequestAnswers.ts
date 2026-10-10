import type { ReplyPullRequestAnswersInput } from "#src/models/coderabbit/collect/ReplyPullRequestAnswersInput";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// A commit answers the comments and reviews of the pull request whose findings it fixed. A window's commits can answer
// Findings of several merged pull requests, so each pull request is replied to for its own answers and no other's: a
// Reply to another pull request's comment is a request GitHub refuses. Returns how many of the findings the commits
// Name are this pull request's, which is how a search for the pull request a finding sits on knows it has found it.
export const replyPullRequestAnswers = ({
  commits,
  isDryRun,
  pullRequest,
  viewerLogin,
}: ReplyPullRequestAnswersInput): number => {
  const commentIds = new Set(readEntries(`pulls/${pullRequest}/comments`).map(({ id }) => id));
  const reviewIds = new Set(readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`).map(({ id }) => id));
  const ownCommits = commits
    .map(({ answers, drains, sha, subject }) => ({
      answers: answers.filter((commentId) => commentIds.has(commentId)),
      drains: drains.filter((reviewId) => reviewIds.has(reviewId)),
      sha,
      subject,
    }))
    .filter(({ answers, drains }) => answers.length > 0 || drains.length > 0);
  if (ownCommits.length > 0)
    replyAnswered({
      commits: ownCommits,
      isDryRun,
      issueComments: readEntries(`issues/${pullRequest}/comments`),
      pullRequest,
      viewerLogin,
    });
  return ownCommits.reduce((count, { answers, drains }) => count + answers.length + drains.length, 0);
};
