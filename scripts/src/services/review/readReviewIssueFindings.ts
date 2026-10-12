import type { ReviewIssueFindings } from "#src/models/review/ReviewIssueFindings";

import { reviewIssueFindingsSchema } from "#src/models/review/ReviewIssueFindings";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The findings file a review run wrote for one issue, validated before a fixer is given it
export const readReviewIssueFindings = (path: string): ReviewIssueFindings => {
  const checked = reviewIssueFindingsSchema.safeParse(jsonDateParse(readFileSync(path, "utf8")));
  if (!checked.success)
    throw new InvalidOperationError(
      Operation.Read,
      "review findings",
      `${path} does not parse: ${checked.error.message}`,
    );

  return checked.data;
};
