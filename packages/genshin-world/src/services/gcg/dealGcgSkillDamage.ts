import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { takeOne } from "@esposter/shared";

// A skill's damage to the opposing active character, with the field of its user's side bearing on it: every additive
// Bonus and conversion first, then every doubling, so a doubling takes in all the bonuses
export const dealGcgSkillDamage = (context: GcgEffectContext, damage: GcgDamage): void => {
  const { duel, sideIndex } = context;
  const side = takeOne(duel.sides, sideIndex);
  const zoneCards = listGcgFieldCards(side, side.activeIndex);
  let dealtDamage = damage;
  for (const zoneCard of zoneCards)
    dealtDamage =
      GcgCardIdModuleMap.get(zoneCard.cardId)?.modifyDamageDealt?.(context, dealtDamage, zoneCard) ?? dealtDamage;
  for (const zoneCard of zoneCards)
    dealtDamage =
      GcgCardIdModuleMap.get(zoneCard.cardId)?.multiplyDamageDealt?.(context, dealtDamage, zoneCard) ?? dealtDamage;
  applyGcgDamage(duel, sideIndex, dealtDamage, duel.rule);
};
