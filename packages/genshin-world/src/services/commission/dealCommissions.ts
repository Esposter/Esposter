import type { Commission } from "#src/models/commission/Commission";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

import { COMMISSION_UNLOCK_RANK, COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { takeOne } from "@esposter/shared";

// The day's commissions dealt from the reached areas' tasks, none before commissions open at their rank. A task whose place
// A quest in progress holds is never dealt, and the rest are shuffled by `random` and the first of them taken, each kept at
// The rank it was dealt at
export const dealCommissions = (
  commissions: readonly Commission[],
  heldPlaces: ReadonlySet<string>,
  rank: number,
  random: () => number,
): CommissionProgress[] => {
  if (rank < COMMISSION_UNLOCK_RANK) return [];
  const dealable = commissions.filter(({ centerPosition }) => !heldPlaces.has(centerPosition));
  const dealCount = Math.min(COMMISSIONS_PER_DAY, dealable.length);
  for (let index = 0; index < dealCount; index++) {
    const pickIndex = index + Math.floor(random() * (dealable.length - index));
    const picked = takeOne(dealable, pickIndex);
    dealable[pickIndex] = takeOne(dealable, index);
    dealable[index] = picked;
  }
  return dealable.slice(0, dealCount).map(({ id }) => ({ commissionId: id, count: 0, dealtRank: rank }));
};
