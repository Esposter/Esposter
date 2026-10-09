import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgEffectContext } from "#src/models/gcg/GcgEffectContext";

// A character's own skill script, for its active character: the damage the skill deals, which is read before it is dealt,
// What the skill leaves on the field once its damage is dealt, and whether a switch away from its character is a fast
// Action, for the passives that make it so
export interface GcgSkillModule {
  afterDamage?: (context: GcgEffectContext) => void;
  getDamage?: (context: GcgEffectContext) => GcgDamage;
  isSwitchFast?: (context: GcgEffectContext) => boolean;
}
