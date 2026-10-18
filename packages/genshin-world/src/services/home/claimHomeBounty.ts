import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { HomeStoreLevels } from "#src/models/home/HomeStoreLevels";

import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { settleHomeStores } from "#src/services/home/settleHomeStores";

// The characters and progress after the realm's Realm Bounty is claimed at `now`: the bounty as it stands then, paid
// Whole to each companion living in the realm, and the store emptied. The Realm Currency settles to `now` too, and
// Keeps what it has accrued since its own last claim. The stores fill at the Adeptal Energy Rank the realm's comfort
// Reaches, up to the limit of the Trust Rank
export const claimHomeBounty = (
  characters: Character[],
  progress: HomeProgress,
  now: Temporal.Instant,
  { comfort, comfortLevels, friendshipLevels, trustLevels }: HomeStoreLevels & { friendshipLevels: FriendshipLevel[] },
): { characters: Character[]; progress: HomeProgress } => {
  const settled = settleHomeStores(progress, now, { comfort, comfortLevels, trustLevels });
  return {
    characters: gainCompanionshipExp(characters, progress.companionIds, settled.realmBounty, friendshipLevels),
    progress: { ...settled, realmBounty: 0 },
  };
};
