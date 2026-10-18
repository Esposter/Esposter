import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { parseGcgDamageEffect } from "#src/services/gcg/effects/parseGcgDamageEffect";

// The damage a skill deals: the one its effect's name spells, or else the one its module reads from the context
export const resolveGcgSkillDamage = (context: GcgEffectContext, skill: GcgSkill): GcgDamage | undefined =>
  parseGcgDamageEffect(skill.effect) ?? GcgEffectNameSkillModuleMap.get(skill.effect)?.getDamage?.(context);
