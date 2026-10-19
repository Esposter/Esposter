import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgZoneCard } from "#src/models/gcg/GcgZoneCard";

import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { findGcgZoneCardOwner } from "#src/services/gcg/effects/findGcgZoneCardOwner";
import { takeOne } from "@esposter/shared";

// The on-use hooks of the cards on a field, for a skill used by the context's character: each card hears the skill with the
// Hits it landed. A card's damage on the skill is not the skill's own hit, so the Plunging Attack bonus does not bear on it
export const runGcgOnSkillUsed = (
  context: GcgEffectContext,
  zoneCards: GcgZoneCard[],
  skill: GcgSkill,
  dealt: GcgDealtDamage[],
): void => {
  const side = takeOne(context.duel.sides, context.sideIndex);
  for (const zoneCard of zoneCards) {
    const characterIndex = findGcgZoneCardOwner(side.characters, zoneCard);
    const skillDamage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSkillUsed?.(
      { ...context, characterIndex },
      skill,
      zoneCard,
      dealt,
    );
    if (skillDamage)
      applyGcgDamage(context.duel, context.sideIndex, skillDamage, context.duel.rule, {
        ...context,
        characterIndex,
        isPlunge: false,
      });
  }
};
