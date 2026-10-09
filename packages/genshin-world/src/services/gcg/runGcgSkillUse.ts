import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { applyGcgDamage, applyGcgStandbyPiercing } from "#src/services/gcg/applyGcgDamage";
import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { dealGcgSkillDamage } from "#src/services/gcg/dealGcgSkillDamage";
import { listGcgFieldCards } from "#src/services/gcg/effects/listGcgFieldCards";
import { parseGcgDamageEffect } from "#src/services/gcg/effects/parseGcgDamageEffect";
import { pruneGcgZoneCards } from "#src/services/gcg/pruneGcgZoneCards";
import { takeOne } from "@esposter/shared";

// Runs a skill's effect for its active character, without paying for it: a shared damage effect, or the character's own
// Script. Then the skill is recorded as used this round and the field's on-use hooks run. Returns false, with nothing run,
// When the skill's effect is one no module covers
export const runGcgSkillUse = (baseContext: GcgEffectContext, skill: GcgSkill): boolean => {
  const context: GcgEffectContext = { ...baseContext, skill };
  const skillModule = GcgEffectNameSkillModuleMap.get(skill.effect);
  const damage = parseGcgDamageEffect(skill.effect) ?? skillModule?.getDamage?.(context);
  if (damage === undefined && !skillModule?.afterDamage) return false;
  if (damage) dealGcgSkillDamage(context, damage);
  const standbyPiercing = skillModule?.getStandbyPiercing?.(context);
  if (standbyPiercing) applyGcgStandbyPiercing(context.duel, context.sideIndex, standbyPiercing);
  skillModule?.afterDamage?.(context);
  const side = takeOne(context.duel.sides, context.sideIndex);
  side.usedSkillIds.push(skill.id);
  for (const zoneCard of listGcgFieldCards(side, side.activeIndex)) {
    const skillDamage = GcgCardIdModuleMap.get(zoneCard.cardId)?.onSkillUsed?.(context, skill, zoneCard);
    if (skillDamage) applyGcgDamage(context.duel, context.sideIndex, skillDamage, context.duel.rule);
  }
  pruneGcgZoneCards(side);
  return true;
};
