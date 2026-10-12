import type { ReviewDisposition } from "#src/models/review/ReviewDisposition";

import { reviewDispositionSchema } from "#src/models/review/ReviewDisposition";
import { z } from "zod";

// A fixer's whole answer: the object its prompt asks it to end on
export interface ReviewDispositionsAnswer {
  dispositions: ReviewDisposition[];
}

export const reviewDispositionsAnswerSchema: z.ZodType<ReviewDispositionsAnswer> = z.object({
  dispositions: z.array(reviewDispositionSchema),
});
