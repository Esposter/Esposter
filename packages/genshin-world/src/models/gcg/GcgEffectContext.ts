import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

// What an effect acts on: the duel, which carries its rule, the side whose card or skill it is, and the skill whose
// Damage is being dealt, when a skill deals it, so a card can tell a normal attack from the rest, and isPlunge says whether
// That skill is a Plunging Attack. The character a card is attached to, as an equipment or a status, is named too, for the
// Hooks that act on that character
export interface GcgEffectContext {
  characterIndex?: number;
  duel: GcgDuel;
  isPlunge?: boolean;
  sideIndex: number;
  skill?: GcgSkill;
}
