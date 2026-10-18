import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgAura } from "#src/models/gcg/GcgAura";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import {
  BURNING_ASSAULT_SKILL,
  PYRO_SCORPION_ID,
  pyroScorpion,
} from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { listGcgActiveSkills } from "#src/services/gcg/effects/listGcgActiveSkills";
import { describe, expect, test } from "vitest";

const NORMAL_ATTACK: GcgSkill = {
  costs: [],
  effect: "Effect_Damage_Fire_3",
  energyGain: 0,
  id: 12_002,
  kind: GcgSkillKind.NormalAttack,
};
const PASSIVE: GcgSkill = {
  costs: [],
  effect: "Char_Skill_23034",
  energyGain: 0,
  id: 23_034,
  kind: GcgSkillKind.Passive,
};

const createCharacter = (skills: GcgSkill[], equipments: GcgCharacterState["equipments"]): GcgCharacterState => ({
  aura: GcgAura.None,
  character: {
    descriptionTextId: 2,
    element: Element.Pyro,
    hp: 10,
    id: 2_303,
    maxEnergy: 3,
    nameTextId: 1,
    skills,
    weapon: "",
  },
  energy: 0,
  equipments,
  hp: 10,
  isFrozen: false,
  shield: 0,
  statuses: [],
});

describe("listGcgActiveSkills", () => {
  test("should list the character's skills without its Passive ones, then the Technique its equipment gives it", () => {
    expect.hasAssertions();

    const character = createCharacter([NORMAL_ATTACK, PASSIVE], [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)]);

    expect(listGcgActiveSkills(character)).toStrictEqual([NORMAL_ATTACK, BURNING_ASSAULT_SKILL]);
  });

  test("should list no Technique for a character whose equipment gives none", () => {
    expect.hasAssertions();

    expect(listGcgActiveSkills(createCharacter([NORMAL_ATTACK], []))).toStrictEqual([NORMAL_ATTACK]);
  });
});
