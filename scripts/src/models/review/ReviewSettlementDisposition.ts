import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";

// One finding's settlement, by the finding's index in the issue's body, from zero
export interface ReviewSettlementDisposition {
  index: number;
  outcome: ReviewSettlementOutcome;
  reason: string;
}
