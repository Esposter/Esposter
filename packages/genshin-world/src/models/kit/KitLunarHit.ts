import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { Combatant } from "#src/models/kit/Combatant";

// What makes a kit hit a direct Lunar hit: the Lunar reaction its damage is dealt as, and the stat its talent multiplier
// Scales, given its striker, its ATK where none is given
export interface KitLunarHit {
  getScalingStat?: (combatant: Combatant) => number;
  lunarReactionType: LunarReactionType;
}
