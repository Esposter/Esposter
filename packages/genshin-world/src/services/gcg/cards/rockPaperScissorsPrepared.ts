import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// The two skills a Rock-Paper-Scissors Combo prepares: Scissors (2 Electro DMG, then prepares Paper) and Paper (3 Electro DMG)
export const ROCK_PAPER_SCISSORS_SCISSORS: GcgSkill = {
  costs: [],
  effect: "Char_Skill_24015",
  energyGain: 0,
  id: 24_015,
  kind: GcgSkillKind.ElementalSkill,
};
export const ROCK_PAPER_SCISSORS_PAPER: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Elec_3",
  energyGain: 0,
  id: 24_016,
  kind: GcgSkillKind.ElementalSkill,
};
