import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { computeHomeAccrued } from "#src/services/home/computeHomeAccrued";
import { computeHomeAdeptalRank } from "#src/services/home/computeHomeAdeptalRank";
import { computeHomeTrustRank } from "#src/services/home/computeHomeTrustRank";

// The realm's progress with its Realm Currency and Realm Bounty settled at `now`: both stores fill from the one clock they share,
// So a claim of either must settle both, or the other loses the time since the last claim
// A clock read before that clock moves nothing, and keeps the later of the two, so no span is counted twice
export const settleHomeStores = (
  progress: HomeProgress,
  now: Temporal.Instant,
  {
    comfort,
    comfortLevels,
    trustLevels,
  }: { comfort: number; comfortLevels: HomeComfortLevel[]; trustLevels: HomeTrustLevel[] },
): HomeProgress => {
  const adeptalRank = computeHomeAdeptalRank(comfort, comfortLevels);
  const trustRank = computeHomeTrustRank(progress.trustExp, trustLevels);
  const comfortLevel = comfortLevels.find(({ level }) => level === adeptalRank);
  const trustLevel = trustLevels.find(({ level }) => level === trustRank);
  const elapsedSeconds = now.since(progress.accruedAt).total({ unit: "second" });
  return {
    ...progress,
    accruedAt: Temporal.Instant.compare(now, progress.accruedAt) > 0 ? now : progress.accruedAt,
    realmBounty: computeHomeAccrued(progress.realmBounty, {
      elapsedSeconds,
      limit: trustLevel?.bountyStoreLimit ?? 0,
      ratePerPeriod: comfortLevel?.bountyRate ?? 0,
    }),
    realmCurrency: computeHomeAccrued(progress.realmCurrency, {
      elapsedSeconds,
      limit: trustLevel?.coinStoreLimit ?? 0,
      ratePerPeriod: comfortLevel?.coinRate ?? 0,
    }),
  };
};
