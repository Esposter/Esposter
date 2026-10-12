import { ReviewOutcome } from "#src/models/review/ReviewOutcome";
import { z } from "zod";

// The fixer's answer to one finding, by the finding's index in the list it was handed
export interface ReviewDisposition {
  index: number;
  outcome: ReviewOutcome;
  reason: string;
}

export const reviewDispositionSchema: z.ZodType<ReviewDisposition> = z.object({
  index: z.int().nonnegative(),
  outcome: z.enum(ReviewOutcome),
  reason: z.string().min(1),
});
