import type { DishUse } from "#src/models/cooking/DishUse";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { DishTarget } from "#src/models/cooking/DishTarget";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Eats a count of a dish from the bag, never more than the bag holds: that many are taken out, a revive lifts the eater
// Where it is down to the HP it restores, a heal is applied to its target, the eater alone or every member the party
// Holds, each healed by the share of Max HP and the flat amount over its own Max HP for every dish eaten, never past
// Full. A bonus is given to the same targets for the seconds it lasts, once however many are eaten, and an anti-cold is
// Held by the team for its own. Undefined, with nothing changed, where the bag holds none of the dish, or a target's
// Max HP is not known yet, which `getMaxHealth` gives as zero
export const eatDish = (
  inventory: Inventory,
  itemId: number,
  dishUse: DishUse,
  {
    count,
    eaterId,
    getMaxHealth,
    kitEffectState,
    party,
  }: {
    count: number;
    eaterId: number;
    getMaxHealth: (characterId: number) => number;
    kitEffectState: KitEffectState;
    party: Party;
  },
): Inventory | undefined => {
  const eatenCount = Math.min(count, countInventoryItem(inventory.items, itemId));
  if (eatenCount <= 0) return undefined;
  const targetIds = dishUse.target === DishTarget.Party ? [...party.characterIdMemberMap.keys()] : [eaterId];
  if (targetIds.some((characterId) => getMaxHealth(characterId) === 0)) return undefined;
  if (dishUse.revive !== undefined) {
    const eater = getPartyMember(party, eaterId);
    if (eater.healthShare === 0) eater.healthShare = Math.min(1, dishUse.revive.flat / getMaxHealth(eaterId));
  }
  if (dishUse.heal !== undefined) {
    const { flat, healthShare } = dishUse.heal;
    for (const characterId of targetIds)
      healPartyMember(party, characterId, (healthShare + flat / getMaxHealth(characterId)) * eatenCount, eaterId);
  }
  if (dishUse.bonus !== undefined) {
    const { attributes, seconds, source } = dishUse.bonus;
    for (const { amount, attribute } of attributes) {
      const buff = { amount, attribute, secondsRemaining: seconds, source };
      if (dishUse.target === DishTarget.Party) buffKitTeam(kitEffectState, party, buff);
      else buffKitMember(kitEffectState, eaterId, buff);
    }
  }
  if (dishUse.antiCold !== undefined)
    addKitEffect(kitEffectState, {
      kind: "antiCold",
      ratio: dishUse.antiCold.ratio,
      secondsRemaining: dishUse.antiCold.seconds,
    });
  return { ...inventory, items: takeInventoryItems(inventory.items, itemId, eatenCount) };
};
