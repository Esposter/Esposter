import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// What an effect acts on: the duel, which carries its rule, the side whose card or skill it is, and the skill whose
// Damage is being dealt, when a skill deals it, so a card can tell a normal attack from the rest
export interface GcgEffectContext {
  duel: GcgDuel;
  sideIndex: number;
  skill?: GcgSkill;
}
