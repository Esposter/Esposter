import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";

// The day's commissions read back from their save, the moment they were dealt read into its Temporal instant
export const toCommissionDay = ({
  claimedCommissionIds,
  dealtAt,
  dealtCommissions,
  isBonusClaimed,
}: CommissionDaySave): CommissionDay => ({
  claimedCommissionIds,
  dealtAt: Temporal.Instant.from(dealtAt),
  dealtCommissions,
  isBonusClaimed,
});
