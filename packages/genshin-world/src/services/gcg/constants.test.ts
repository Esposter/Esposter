import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { describe } from "vitest";

// A prepared Elemental Skill that deals 3 Electro DMG, as the Rock-Paper-Scissors Combo's Paper does
export const PREPARED_SKILL: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Elec_3",
  energyGain: 0,
  id: 24_016,
  kind: GcgSkillKind.ElementalSkill,
};
export const ELECTRO_CHARACTER = { descriptionTextId: 1002, element: Element.Electro, nameTextId: 1001 };

describe.todo("constants");
