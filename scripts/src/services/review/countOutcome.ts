import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";
import type { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";

export const countOutcome = (dispositions: ReviewSettlementDisposition[], outcome: ReviewSettlementOutcome): number =>
  dispositions.filter((disposition) => disposition.outcome === outcome).length;
