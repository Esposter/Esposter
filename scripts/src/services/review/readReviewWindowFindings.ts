import type { ReviewWindowFindings } from "#src/models/review/ReviewWindowFindings";

import { reviewWindowFindingsSchema } from "#src/models/review/ReviewWindowFindings";
import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The findings file a review run wrote for one window, validated before a fixer is given it
export const readReviewWindowFindings = (path: string): ReviewWindowFindings => {
  const checked = reviewWindowFindingsSchema.safeParse(jsonDateParse(readFileSync(path, "utf8")));
  if (!checked.success)
    throw new InvalidOperationError(
      Operation.Read,
      "review findings",
      `${path} does not parse: ${checked.error.message}`,
    );

  return checked.data;
};
