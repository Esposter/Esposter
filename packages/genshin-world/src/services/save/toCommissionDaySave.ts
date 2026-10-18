import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";

// The day's commissions as their save holds them, the moment they were dealt as its ISO string
export const toCommissionDaySave = ({
  claimedCommissionIds,
  dealtAt,
  dealtCommissions,
}: CommissionDay): CommissionDaySave => ({ claimedCommissionIds, dealtAt: dealtAt.toString(), dealtCommissions });
