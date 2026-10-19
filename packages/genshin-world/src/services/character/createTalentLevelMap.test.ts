import { CombatTalent } from "#src/models/character/CombatTalent";
import { createTalentLevelMap } from "#src/services/character/createTalentLevelMap";
import { describe, expect, test } from "vitest";

describe(createTalentLevelMap, () => {
  test("maps each combat talent's proud skill group to the level that talent plays at", () => {
    expect.hasAssertions();

    expect(
      createTalentLevelMap(
        { [CombatTalent.ElementalBurst]: 3, [CombatTalent.ElementalSkill]: 2, [CombatTalent.NormalAttack]: 1 },
        { [CombatTalent.ElementalBurst]: 10, [CombatTalent.ElementalSkill]: 13, [CombatTalent.NormalAttack]: 1 },
      ),
    ).toStrictEqual({ 1: 1, 2: 13, 3: 10 });
  });
});
