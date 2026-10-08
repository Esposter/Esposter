import type { ReplyPullRequestAnswersInput } from "#src/models/coderabbit/collect/ReplyPullRequestAnswersInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { replyAnswered } from "#src/services/coderabbit/collect/replyAnswered";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";

// A commit answers the comments and reviews of the pull request whose findings it fixed. A window's commits can answer
// Findings of several merged pull requests, so each pull request is replied to for its own answers and no other's: a
// Reply to another pull request's comment is a request GitHub refuses.
export const replyPullRequestAnswers = ({
  commits,
  isDryRun,
  pullRequest,
  viewerLogin,
}: ReplyPullRequestAnswersInput): void => {
  const commentIds = new Set(readEntries<GitHubEntry>(`pulls/${pullRequest}/comments`).map(({ id }) => id));
  const reviewIds = new Set(readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`).map(({ id }) => id));
  replyAnswered({
    commits: commits.map(({ answers, drains, sha, subject }) => ({
      answers: answers.filter((commentId) => commentIds.has(commentId)),
      drains: drains.filter((reviewId) => reviewIds.has(reviewId)),
      sha,
      subject,
    })),
    isDryRun,
    issueComments: readEntries<GitHubEntry>(`issues/${pullRequest}/comments`),
    pullRequest,
    viewerLogin,
  });
};
