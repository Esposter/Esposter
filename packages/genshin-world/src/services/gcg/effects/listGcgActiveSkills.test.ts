import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { BURNING_ASSAULT_SKILL, pyroScorpion } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { PYRO_SCORPION_ID } from "#src/services/gcg/cards/constants";
import { createGcgCharacterState } from "#src/services/gcg/createGcgCharacterState.test";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { listGcgActiveSkills } from "#src/services/gcg/effects/listGcgActiveSkills";
import { describe, expect, test } from "vitest";

describe(listGcgActiveSkills, () => {
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

  test("should list the character's skills without its Passive ones, then the Technique its equipment gives it", () => {
    expect.hasAssertions();

    const character = createGcgCharacterState({
      character: { skills: [NORMAL_ATTACK, PASSIVE], element: Element.Pyro, id: 2_303 },
      equipments: [createGcgZoneCard(PYRO_SCORPION_ID, pyroScorpion)],
    });

    expect(listGcgActiveSkills(character)).toStrictEqual([NORMAL_ATTACK, BURNING_ASSAULT_SKILL]);
  });

  test("should list no Technique for a character whose equipment gives none", () => {
    expect.hasAssertions();

    expect(
      listGcgActiveSkills(
        createGcgCharacterState({
          character: { skills: [NORMAL_ATTACK], element: Element.Pyro, id: 2_303 },
          equipments: [],
        }),
      ),
    ).toStrictEqual([NORMAL_ATTACK]);
  });
});
