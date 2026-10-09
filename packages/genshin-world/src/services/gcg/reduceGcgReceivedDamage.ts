import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { takeOne } from "@esposter/shared";

// The damage a side takes once its summons have had their say: each summon that reduces the damage it receives does so,
// In the order the side has them
export const reduceGcgReceivedDamage = (duel: GcgDuel, sideIndex: number, damage: GcgDamage): GcgDamage => {
  let value = damage.value;
  for (const zoneCard of takeOne(duel.sides, sideIndex).summons)
    value =
      GcgCardIdModuleMap.get(zoneCard.cardId)?.modifyDamageReceived?.({ duel, sideIndex }, value, zoneCard) ?? value;
  return { ...damage, value };
};
