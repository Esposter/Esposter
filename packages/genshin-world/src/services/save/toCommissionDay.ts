import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";

import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";

// The day's commissions read back from their save, the moment they were dealt read into its Temporal instant. Katheryne's
// Bonus was paid on the day's fourth claim before she gave it, so a save of four claims without the flag has had it
export const toCommissionDay = ({
  claimedCommissionIds,
  dealtAt,
  dealtCommissions,
  isBonusClaimed,
}: CommissionDaySave): CommissionDay => ({
  claimedCommissionIds,
  dealtAt: Temporal.Instant.from(dealtAt),
  dealtCommissions,
  isBonusClaimed: isBonusClaimed ?? claimedCommissionIds.length === COMMISSIONS_PER_DAY,
});
