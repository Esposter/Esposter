import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { settleHomeStores } from "#src/services/home/settleHomeStores";

// The characters and progress after the realm's Realm Bounty is claimed at `now`: the bounty as it stands then, paid whole to
// Each companion living in the realm, and the store emptied. The Realm Currency settles on the same clock, so the currency earned
// Since the last claim is kept. The stores fill at the Adeptal Energy Rank the realm's comfort reaches, up to the limit of the Trust Rank
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
  const settled = settleHomeStores(progress, now, { comfort, comfortLevels, trustLevels });
  return {
    characters: gainCompanionshipExp(characters, progress.companionIds, settled.realmBounty, friendshipLevels),
    progress: { ...settled, realmBounty: 0 },
  };
};
