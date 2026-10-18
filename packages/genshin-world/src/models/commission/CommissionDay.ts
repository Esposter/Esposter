import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

// The day's commissions: the four dealt at the daily reset with the moment they were dealt, and the ids of those
// Claimed so far
export interface CommissionDay {
  claimedCommissionIds: number[];
  dealtAt: Temporal.Instant;
  dealtCommissions: CommissionProgress[];
}
