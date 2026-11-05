import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";
import type { RewardRouting } from "#src/models/reward/RewardRouting";

import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { countRewardItem } from "#src/services/reward/countRewardItem";
import { gainDeployedCompanionshipExp } from "#src/services/reward/gainDeployedCompanionshipExp";
import { routeRewardItems } from "#src/services/reward/routeRewardItems";

// The state after a commission claim's rewards are routed: the Adventure EXP its items hold through the rank, the
// Companionship EXP its items hold to the deployed team, and the rest of its items through the routing every claim shares.
// Undefined where the bag cannot take an item whole, so nothing is routed or recorded
export const routeCommissionClaim = (
  adventureRankTables: AdventureRankTables,
  adventureExp: number,
  characters: readonly Character[],
  items: readonly ItemCount[],
  completedMainQuestIds: ReadonlySet<string>,
  friendshipLevels: FriendshipLevels,
  inventory: Inventory,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  names: Readonly<Record<string, string>>,
  party: Party,
  wallet: Wallet,
): RewardRouting | undefined => {
  const routed = routeRewardItems(
    adventureRankTables,
    adventureExp,
    countRewardItem(items, ADVENTURE_EXP_ITEM_ID),
    completedMainQuestIds,
    wallet,
    inventory,
    items,
    names,
    materialDataMap,
  );
  if (!routed) return undefined;
  return {
    adventureExp: routed.adventureExp,
    characters: gainDeployedCompanionshipExp(characters, items, party, friendshipLevels),
    inventory: routed.inventory,
    wallet: routed.wallet,
  };
};
