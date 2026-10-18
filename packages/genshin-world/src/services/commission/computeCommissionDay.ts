import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";

import { checkIsCommissionDayCurrent } from "#src/services/commission/checkIsCommissionDayCurrent";
import { dealCommissions } from "#src/services/commission/dealCommissions";

// The day the session holds once its save is loaded: a day dealt at or after the latest daily reset with commissions in it is
// Kept as it is. A day dealt before the reset, or with none in it (dealt before Adventure Rank 12 opened), is dealt again from
// The pool, the places no quest in progress holds and the rank the session holds
export const computeCommissionDay = (
  day: CommissionDay,
  now: Temporal.Instant,
  commissions: readonly Commission[],
  heldPlaces: ReadonlySet<string>,
  rank: number,
  random: () => number,
): CommissionDay =>
  checkIsCommissionDayCurrent(day.dealtAt, now) && day.dealtCommissions.length > 0
    ? day
    : {
        claimedCommissionIds: [],
        dealtAt: now,
        isBonusClaimed: false,
        dealtCommissions: dealCommissions(commissions, heldPlaces, rank, random),
      };
