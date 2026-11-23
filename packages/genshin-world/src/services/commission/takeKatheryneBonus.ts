import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { computeCommissionBand } from "#src/services/commission/computeCommissionBand";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { takeBandItems } from "#src/services/commission/takeBandItems";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";

// The state after Katheryne gives the day's bonus: the day marked as its bonus claimed, and the bonus drawn from the score
// Preview of the band the rank held now falls in. Undefined where the day's four are not all claimed, or the bonus is claimed
export const takeKatheryneBonus = (
  day: CommissionDay,
  slice: CommissionSlice,
  rank: number,
  random: () => number,
): { bonus: ItemCount[]; day: CommissionDay } | undefined => {
  if (day.isBonusClaimed || day.claimedCommissionIds.length < COMMISSIONS_PER_DAY) return undefined;
  return {
    bonus: drawRewardItems(takeBandItems(slice.bonuses, computeCommissionBand(rank), "the daily bonus"), random),
    day: { ...day, isBonusClaimed: true },
  };
};
