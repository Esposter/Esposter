import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// One of a character's skills as the card gives it: its id, what it costs, the effect the game names it by (a shared effect
// Such as Effect_Damage_Fire_3, or the character's own script such as Char_Skill_13012), the energy its user gains on use
// (1 for a normal attack or an elemental skill, none for a burst or a passive), and its kind
export interface GcgSkill {
  costs: GcgCost[];
  effect: string;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}
