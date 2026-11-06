import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { Party } from "#src/models/party/Party";

import { gainCompanionshipExp } from "#src/services/friendship/gainCompanionshipExp";
import { countItemCost } from "#src/services/inventory/countItemCost";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// The Companionship EXP a claim's items hold, given whole to each character of the deployed team
export const gainDeployedCompanionshipExp = (
  characters: readonly Character[],
  items: readonly ItemCount[],
  party: Party,
  friendshipLevels: FriendshipLevels,
): Character[] =>
  gainCompanionshipExp(
    characters,
    getDeployedCharacterIds(party),
    countItemCost(items, COMPANIONSHIP_EXP_ITEM_ID),
    friendshipLevels,
  );
