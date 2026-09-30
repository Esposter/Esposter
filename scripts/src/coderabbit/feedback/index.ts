import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { getFeedbackReport } from "#src/services/coderabbit/feedback/getFeedbackReport";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

await runMain(
  defineCommand({
    args: { pullRequest: { description: "The pull request's number", required: true, type: "positional" } },
    meta: {
      description: "The CodeRabbit review's findings on a pull request, and its open threads",
      name: "ai:coderabbit:feedback",
    },
    run: ({ args }) => {
      const pullRequest = Number(args.pullRequest);
      if (!checkIsGitHubNumber(pullRequest))
        throw new InvalidOperationError(Operation.Read, "coderabbit", "a pull request number is required");
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
    },
  }),
);
