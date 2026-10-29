import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";

import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";
import { z } from "zod";

// A settler's whole answer: the object its prompt asks it to end on
export interface ReviewSettlementDispositionsAnswer {
  dispositions: ReviewSettlementDisposition[];
}

export const reviewSettlementDispositionsAnswerSchema: z.ZodType<ReviewSettlementDispositionsAnswer> = z.object({
  dispositions: z.array(
    z.object({ index: z.int().nonnegative(), outcome: z.enum(ReviewSettlementOutcome), reason: z.string().min(1) }),
  ),
});
