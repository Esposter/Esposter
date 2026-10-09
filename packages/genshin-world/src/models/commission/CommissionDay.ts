import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

// The day's commissions: the four dealt at the daily reset, and the ids of those claimed so far
export interface CommissionDay {
  claimedCommissionIds: number[];
  dealtCommissions: CommissionProgress[];
}
