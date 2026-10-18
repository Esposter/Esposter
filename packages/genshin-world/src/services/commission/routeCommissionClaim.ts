import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { CommissionRouting } from "#src/models/commission/CommissionRouting";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";

import { Currency } from "#src/models/inventory/Currency";
import { gainAdventureExp } from "#src/services/adventureRank/gainAdventureExp";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The state after a commission claim's items are routed as a blossom's claim routes its draws: the Mora and the Mora
// Its Adventure EXP pays past rank 60 into the wallet, the Adventure EXP into the rank, the Companionship EXP into the
// Deployed team's friendship, and every other item into the bag. Undefined where the bag cannot take an item whole, which
// Refuses the claim, so nothing is routed and the claim is not recorded
export const routeCommissionClaim = (
  adventureRankTables: AdventureRankTables,
  adventureExp: number,
  characters: readonly Character[],
  items: readonly ItemCount[],
  completedMainQuestIds: ReadonlySet<string>,
  friendshipLevels: readonly FriendshipLevel[],
  inventory: Inventory,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  names: Readonly<Record<string, string>>,
  party: Party,
  wallet: Wallet,
): CommissionRouting | undefined => {
  let claimedInventory = inventory;
  let moraCount = 0;
  let adventureExpCount = 0;
  let companionshipExpCount = 0;
  for (const { count, id } of items)
    if (id === MORA_ITEM_ID) moraCount += count;
    else if (id === ADVENTURE_EXP_ITEM_ID) adventureExpCount += count;
    else if (id === COMPANIONSHIP_EXP_ITEM_ID) companionshipExpCount += count;
    else {
      const addition = addInventoryItem(claimedInventory, getItemDefinition(id, names, materialDataMap), count);
      if (addition.overflow > 0) return undefined;
      claimedInventory = addition.inventory;
    }
  const gain = gainAdventureExp(adventureRankTables, adventureExp, adventureExpCount, completedMainQuestIds);
  return {
    adventureExp: gain.adventureExp,
    characters: gainCompanionshipExp(
      characters,
      getDeployedCharacterIds(party),
      companionshipExpCount,
      friendshipLevels,
    ),
    inventory: claimedInventory,
    wallet: { ...wallet, [Currency.Mora]: wallet[Currency.Mora] + moraCount + gain.moraPaid },
  };
};
