import type { GcgCost } from "#src/models/gcg/GcgCost";
import type { GcgDamage } from "#src/models/gcg/GcgDamage";
import type { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// One of a character's skills as the card gives it: its id, what it costs, the damage it deals, the energy its user gains
// On use (1 for a normal attack or an elemental skill, none for a burst), and its kind
export interface GcgSkill {
  costs: GcgCost[];
  damage: GcgDamage;
  energyGain: number;
  id: number;
  kind: GcgSkillKind;
}
