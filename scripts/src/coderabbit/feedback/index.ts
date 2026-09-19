import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { getPullRequestArgument } from "#src/services/coderabbit/shared/getPullRequestArgument";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";

const pullRequest = getPullRequestArgument();
const review = readBotEntries<GitHubReview>(`pulls/${pullRequest}/reviews`).findLast(({ body }) => body);
if (!review)
  throw new InvalidOperationError(Operation.Read, "coderabbit", `no review body on pull request ${pullRequest}`);

console.info(
  getFeedbackReport({
    issueComments: readEntries<GitHubEntry>(`issues/${pullRequest}/comments`),
    isThreadListed: true,
    review,
    threads: readUnresolvedThreads(pullRequest),
  }),
);
