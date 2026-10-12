import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { reviewFindingSchema } from "#src/models/review/ReviewFinding";
import { z } from "zod";

// A reviewer's whole answer: the object its prompt asks it to end on
export interface ReviewFindingsAnswer {
  findings: ReviewFinding[];
}

export const reviewFindingsAnswerSchema: z.ZodType<ReviewFindingsAnswer> = z.object({
  findings: z.array(reviewFindingSchema),
});
