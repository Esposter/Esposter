import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeStoreLevels } from "#src/models/home/HomeStoreLevels";

import { computeHomeAccrued } from "#src/services/home/computeHomeAccrued";
import { computeHomeAdeptalRank } from "#src/services/home/computeHomeAdeptalRank";
import { computeHomeTrustRank } from "#src/services/home/computeHomeTrustRank";

// The realm's progress with its Realm Currency and Realm Bounty settled to `now`, each store from the instant it last
// Accrued to. A store moves only its own instant, so a claim of either leaves the other store the time its whole units
// Did not use
export const settleHomeStores = (
  progress: HomeProgress,
  now: Temporal.Instant,
  { comfort, comfortLevels, trustLevels }: HomeStoreLevels,
): HomeProgress => {
  const adeptalRank = computeHomeAdeptalRank(comfort, comfortLevels);
  const trustRank = computeHomeTrustRank(progress.trustExp, trustLevels);
  const comfortLevel = comfortLevels.find(({ level }) => level === adeptalRank);
  const trustLevel = trustLevels.find(({ level }) => level === trustRank);
  const bounty = computeHomeAccrued(progress.realmBounty, progress.realmBountyAccruedAt, now, {
    limit: trustLevel?.bountyStoreLimit ?? 0,
    ratePerPeriod: comfortLevel?.bountyRate ?? 0,
  });
  const currency = computeHomeAccrued(progress.realmCurrency, progress.realmCurrencyAccruedAt, now, {
    limit: trustLevel?.coinStoreLimit ?? 0,
    ratePerPeriod: comfortLevel?.coinRate ?? 0,
  });
  return {
    ...progress,
    realmBounty: bounty.amount,
    realmBountyAccruedAt: bounty.accruedAt,
    realmCurrency: currency.amount,
    realmCurrencyAccruedAt: currency.accruedAt,
  };
};
