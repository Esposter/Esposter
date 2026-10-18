import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { takeOne } from "@esposter/shared";

// The damage a side's active character takes once the cards bearing on it have had their say: its own statuses and
// Equipments, then the side's supports, summons and onstage cards, each that reduces the damage it receives doing so in
// The order the field lists them
export const reduceGcgReceivedDamage = (duel: GcgDuel, sideIndex: number, damage: GcgDamage): GcgDamage => {
  const side = takeOne(duel.sides, sideIndex);
  let value = damage.value;
  for (const zoneCard of listGcgFieldCards(side, side.activeIndex))
    value =
      duel.cardModules
        .get(zoneCard.cardId)
        ?.modifyDamageReceived?.({ duel, sideIndex }, value, zoneCard, damage.damageType) ?? value;
  return { ...damage, value };
};
