import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { settleHomeStores } from "#src/services/home/settleHomeStores";

// The Realm Currency paid out by a claim at `now`, and the progress with its store emptied. The stores are settled first, so the
// Currency is what it filled to at the Adeptal Energy Rank in force, up to the limit of the Trust Rank its Trust EXP reaches
export const claimHomeCurrency = (
  progress: HomeProgress,
  now: Temporal.Instant,
  {
    comfort,
    comfortLevels,
    trustLevels,
  }: { comfort: number; comfortLevels: HomeComfortLevel[]; trustLevels: HomeTrustLevel[] },
): { currency: number; progress: HomeProgress } => {
  const settled = settleHomeStores(progress, now, { comfort, comfortLevels, trustLevels });
  return { currency: settled.realmCurrency, progress: { ...settled, realmCurrency: 0 } };
};
