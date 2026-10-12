import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";
import { z } from "zod";

// One finding's settlement, by the finding's index in the issue's body, from zero
export interface ReviewSettlementDisposition {
  index: number;
  outcome: ReviewSettlementOutcome;
  reason: string;
}

// A settler's whole answer: the object its prompt asks it to end on
export interface ReviewSettlementDispositionsAnswer {
  dispositions: ReviewSettlementDisposition[];
}

export const reviewSettlementDispositionsAnswerSchema: z.ZodType<ReviewSettlementDispositionsAnswer> = z.object({
  dispositions: z.array(
    z.object({ index: z.int().nonnegative(), outcome: z.enum(ReviewSettlementOutcome), reason: z.string().min(1) }),
  ),
});
