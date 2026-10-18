import type { Constellation } from "#src/models/character/Constellation";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { getPlayedTalentLevels } from "#src/services/character/getPlayedTalentLevels";
import { describe, expect, test } from "vitest";

describe(getPlayedTalentLevels, () => {
  const CONSTELLATIONS: Constellation[] = [
    { descriptionTextId: "1", nameTextId: "1", paramList: [] },
    { descriptionTextId: "2", nameTextId: "2", paramList: [] },
    {
      descriptionTextId: "3",
      nameTextId: "3",
      paramList: [],
      raise: { levels: 3, talent: CombatTalent.ElementalSkill },
    },
  ];

  // oxlint-disable-next-line vitest/prefer-lowercase-title -- the spec names this test by its capitalised sentence, the Verify criterion
  test("A constellation raises a talent above level ten", () => {
    expect.hasAssertions();

    expect(
      getPlayedTalentLevels(
        {
          constellationCount: 3,
          talentLevels: {
            [CombatTalent.ElementalBurst]: 1,
            [CombatTalent.ElementalSkill]: 10,
            [CombatTalent.NormalAttack]: 1,
          },
        },
        CONSTELLATIONS,
      ),
    ).toStrictEqual({
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 13,
      [CombatTalent.NormalAttack]: 1,
    });
  });
});
