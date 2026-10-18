import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { computeHomeAccrued } from "#src/services/home/computeHomeAccrued";
import { computeHomeAdeptalRank } from "#src/services/home/computeHomeAdeptalRank";
import { computeHomeTrustRank } from "#src/services/home/computeHomeTrustRank";

// The characters and progress after the realm's Realm Bounty is claimed at `now`: the store as it stands then, paid whole to
// Each companion living in the realm, and the store emptied from `now`. The store fills at the rate of the Adeptal Energy
// Rank the realm's comfort reaches, up to the limit of the Trust Rank its Trust EXP reaches
export const claimHomeBounty = (
  characters: Character[],
  progress: HomeProgress,
  now: Temporal.Instant,
  {
    comfort,
    comfortLevels,
    friendshipLevels,
    trustLevels,
  }: {
    comfort: number;
    comfortLevels: HomeComfortLevel[];
    friendshipLevels: FriendshipLevel[];
    trustLevels: HomeTrustLevel[];
  },
): { characters: Character[]; progress: HomeProgress } => {
  const adeptalRank = computeHomeAdeptalRank(comfort, comfortLevels);
  const trustRank = computeHomeTrustRank(progress.trustExp, trustLevels);
  const bounty = computeHomeAccrued(progress.realmBounty, {
    elapsedSeconds: now.since(progress.accruedAt).total({ unit: "second" }),
    limit: trustLevels.find(({ level }) => level === trustRank)?.bountyStoreLimit ?? 0,
    ratePerPeriod: comfortLevels.find(({ level }) => level === adeptalRank)?.bountyRate ?? 0,
  });
  return {
    characters: gainCompanionshipExp(characters, progress.companionIds, bounty, friendshipLevels),
    progress: { ...progress, accruedAt: now, realmBounty: 0 },
  };
};
