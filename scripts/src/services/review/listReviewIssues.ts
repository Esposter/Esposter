import type { ReviewIssue } from "#src/models/review/ReviewIssue";

import { reviewIssueSchema } from "#src/models/review/ReviewIssue";
import { REVIEW_ISSUE_LABEL } from "#src/services/review/constants";
import { runGh } from "#src/services/shared/runGh";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { z } from "zod";

const reviewIssuesSchema: z.ZodType<ReviewIssue[]> = z.array(reviewIssueSchema);

// Every open review issue, oldest first, so the settle job takes the earliest findings first
export const listReviewIssues = (): ReviewIssue[] => {
  const listed = reviewIssuesSchema.safeParse(
    jsonDateParse(
      runGh([
        "issue",
        "list",
        "--label",
        REVIEW_ISSUE_LABEL,
        "--state",
        "open",
        "--json",
        "number,body,title,createdAt",
        "--limit",
        "1000",
      ]),
    ),
  );
  if (!listed.success)
    throw new InvalidOperationError(
      Operation.Read,
      "review issues",
      `the listing does not parse: ${listed.error.message}`,
    );

  return listed.data.toSorted((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
};
