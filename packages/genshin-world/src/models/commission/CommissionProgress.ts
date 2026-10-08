// One of the day's commissions as the player holds it: its count of finishing doings so far, and the Adventure Rank it was
// Dealt at, which is the rank its reward is paid for
export interface CommissionProgress {
  commissionId: number;
  count: number;
  dealtRank: number;
}
