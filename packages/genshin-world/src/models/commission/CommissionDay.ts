import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

// The day's commissions: the four dealt at the daily reset with the moment they were dealt, the ids of those claimed so
// Far, and whether Katheryne's bonus is claimed, which she gives once the four are
export interface CommissionDay {
  claimedCommissionIds: number[];
  dealtAt: Temporal.Instant;
  dealtCommissions: CommissionProgress[];
  isBonusClaimed: boolean;
}
