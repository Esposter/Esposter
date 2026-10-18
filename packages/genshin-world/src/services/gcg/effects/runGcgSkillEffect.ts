import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { applyGcgDamage, applyGcgStandbyPiercing } from "#src/services/gcg/applyGcgDamage";
import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { takeOne } from "@esposter/shared";

// A skill's effect as it lands: its damage dealt with the field's bonuses, its standby piercing, then its after-effect, which
// Reads the hits, and the skill recorded as used this round. Returns the hits the skill landed, its damage and its standby
// Piercing alike. A prepared skill is recorded as used too, provisionally, since the wiki does not say whether it counts
export const runGcgSkillEffect = (
  context: GcgEffectContext,
  skill: GcgSkill,
  damage: GcgDamage | undefined,
): GcgDealtDamage[] => {
  const skillModule = GcgEffectNameSkillModuleMap.get(skill.effect);
  const dealt: GcgDealtDamage[] = damage
    ? applyGcgDamage(context.duel, context.sideIndex, damage, context.duel.rule, context)
    : [];
  const standbyPiercing = skillModule?.getStandbyPiercing?.(context);
  if (standbyPiercing) dealt.push(...applyGcgStandbyPiercing(context.duel, context.sideIndex, standbyPiercing, skill));
  skillModule?.afterDamage?.(context);
  takeOne(context.duel.sides, context.sideIndex).usedSkillIds.push(skill.id);
  return dealt;
};
