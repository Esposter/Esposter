import { GcgEffectNameSkillModuleMap } from "#src/services/gcg/cards/gcgEffectNameSkillModuleMap";
import { parseGcgDamageEffect } from "#src/services/gcg/effects/parseGcgDamageEffect";

// Whether a skill's effect is one a duel runs: a shared damage effect, or a character's own script
export const checkIsGcgSkillRunnable = (effect: string): boolean =>
  parseGcgDamageEffect(effect) !== undefined || GcgEffectNameSkillModuleMap.get(effect)?.getDamage !== undefined;
