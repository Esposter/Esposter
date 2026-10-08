import type { Constellation } from "#src/models/character/Constellation";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { getConstellationTalentAdditions } from "#src/services/character/getConstellationTalentAdditions";
import { describe, expect, test } from "vitest";

describe(getConstellationTalentAdditions, () => {
  const CONSTELLATIONS: Constellation[] = [
    { descriptionTextId: "1", nameTextId: "1", paramList: [] },
    { descriptionTextId: "2", nameTextId: "2", paramList: [] },
    {
      descriptionTextId: "3",
      nameTextId: "3",
      paramList: [],
      raise: { levels: 3, talent: CombatTalent.ElementalBurst },
    },
    { descriptionTextId: "4", nameTextId: "4", paramList: [] },
    {
      descriptionTextId: "5",
      nameTextId: "5",
      paramList: [],
      raise: { levels: 3, talent: CombatTalent.ElementalSkill },
    },
  ];

  test("adds nothing before the third constellation is active", () => {
    expect.hasAssertions();

    expect(getConstellationTalentAdditions(CONSTELLATIONS, 2)).toStrictEqual({
      [CombatTalent.ElementalBurst]: 0,
      [CombatTalent.ElementalSkill]: 0,
      [CombatTalent.NormalAttack]: 0,
    });
  });

  test("adds each active raise to the talent it names", () => {
    expect.hasAssertions();

    expect(getConstellationTalentAdditions(CONSTELLATIONS, 5)).toStrictEqual({
      [CombatTalent.ElementalBurst]: 3,
      [CombatTalent.ElementalSkill]: 3,
      [CombatTalent.NormalAttack]: 0,
    });
  });
});
