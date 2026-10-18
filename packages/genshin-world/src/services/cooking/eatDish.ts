import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Party } from "#src/models/party/Party";

import { DishTarget } from "#src/models/cooking/DishTarget";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Eats one of a dish from the bag: one is taken out, a revive lifts the eater where it is down to the HP it restores,
// And a heal is applied to its target, the eater alone or every member the party holds, each healed by the share of Max
// HP and the flat amount over its own Max HP, never past full. Undefined, with nothing changed, where the bag holds none
// Of the dish or a target's Max HP is not known yet, which `getMaxHealth` gives as zero
export const eatDish = (
  inventory: Inventory,
  itemId: number,
  dishUse: DishUse,
  { eaterId, getMaxHealth, party }: { eaterId: number; getMaxHealth: (characterId: number) => number; party: Party },
): Inventory | undefined => {
  if (countInventoryItem(inventory.items, itemId) === 0) return undefined;
  const targetIds = dishUse.target === DishTarget.Party ? [...party.characterIdMemberMap.keys()] : [eaterId];
  if (targetIds.some((characterId) => getMaxHealth(characterId) === 0)) return undefined;
  if (dishUse.revive !== undefined) {
    const eater = getPartyMember(party, eaterId);
    if (eater.healthShare === 0) eater.healthShare = Math.min(1, dishUse.revive.flat / getMaxHealth(eaterId));
  }
  if (dishUse.heal !== undefined) {
    const { flat, healthShare } = dishUse.heal;
    for (const characterId of targetIds)
      healPartyMember(party, characterId, healthShare + flat / getMaxHealth(characterId), eaterId);
  }
  return { items: takeInventoryItems(inventory.items, itemId, 1), nextId: inventory.nextId };
};
