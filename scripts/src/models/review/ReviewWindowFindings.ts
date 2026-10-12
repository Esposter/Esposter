import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { reviewFindingSchema } from "#src/models/review/ReviewFinding";
import { z } from "zod";

// What a passed window with findings hands its fixer: the window's base and end, and the findings its reviewers answered
// With. The run writes it as a file in its findings directory, and `ai:review:fix` reads it back.
export interface ReviewWindowFindings {
  base: string;
  end: string;
  findings: ReviewFinding[];
}

export const reviewWindowFindingsSchema: z.ZodType<ReviewWindowFindings> = z.object({
  base: z.string().min(1),
  end: z.string().min(1),
  findings: z.array(reviewFindingSchema),
});
