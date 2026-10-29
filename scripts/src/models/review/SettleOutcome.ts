import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";

// What one issue's settler produced: its dispositions, or the error that ended it
export type SettleOutcome = { dispositions: ReviewSettlementDisposition[] } | { error: Error };
