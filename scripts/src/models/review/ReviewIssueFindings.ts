import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { reviewFindingSchema } from "#src/models/review/ReviewFinding";
import { z } from "zod";

// What a review issue hands its fixer: the window's base and end, the issue's number, and the findings the issue holds.
// The run writes it as a file in its findings directory, and `ai:review:fix` reads it back.
export interface ReviewIssueFindings {
  base: string;
  end: string;
  findings: ReviewFinding[];
  issue: number;
}

export const reviewIssueFindingsSchema: z.ZodType<ReviewIssueFindings> = z.object({
  base: z.string().min(1),
  end: z.string().min(1),
  findings: z.array(reviewFindingSchema),
  issue: z.int().positive(),
});
