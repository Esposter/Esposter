import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { takeOne } from "@esposter/shared";

// A damage its side's field bears on before it lands: every additive bonus and conversion first, then every doubling, so a
// Doubling takes in all the bonuses. Every damage its side deals goes through it, a skill's hit, a Swirl's spread, a
// Piercing and an End Phase DMG alike
export const modifyGcgDamageDealt = (context: GcgEffectContext, damage: GcgDamage): GcgDamage => {
  const { duel, sideIndex } = context;
  const side = takeOne(duel.sides, sideIndex);
  const zoneCards = listGcgFieldCards(side, side.activeIndex);
  let dealtDamage = damage;
  for (const zoneCard of zoneCards)
    dealtDamage =
      duel.cardModules.get(zoneCard.cardId)?.modifyDamageDealt?.(context, dealtDamage, zoneCard) ?? dealtDamage;
  for (const zoneCard of zoneCards)
    dealtDamage =
      duel.cardModules.get(zoneCard.cardId)?.multiplyDamageDealt?.(context, dealtDamage, zoneCard) ?? dealtDamage;
  return dealtDamage;
};
