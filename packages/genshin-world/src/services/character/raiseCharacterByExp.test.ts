import type { Character } from "#src/models/character/Character";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { raiseCharacterByExp } from "#src/services/character/raiseCharacterByExp";
import { readStatTables } from "#src/services/character/readStatTables";
import { describe, expect, test } from "vitest";

const { characterExpToNext: expToNext } = await readStatTables(GAME_DATA_LOCAL_BASE_URL);

describe(raiseCharacterByExp, () => {
  // A made-up character and cap, since no record is copied into a test. The EXP each level takes is read from the table
  const MAX_LEVEL = 20;
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id: 1,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };

  test("a character is raised a level for each level's EXP its EXP covers", () => {
    expect.hasAssertions();
    const [firstLevelExp = 0, secondLevelExp = 0] = expToNext;
    expect(raiseCharacterByExp(CHARACTER, firstLevelExp + secondLevelExp - 1, MAX_LEVEL, expToNext)).toStrictEqual({
      ...CHARACTER,
      level: 2,
    });
    expect(raiseCharacterByExp(CHARACTER, firstLevelExp + secondLevelExp, MAX_LEVEL, expToNext)).toStrictEqual({
      ...CHARACTER,
      level: 3,
    });
  });

  test("a character is never raised past its max level", () => {
    expect.hasAssertions();
    expect(raiseCharacterByExp(CHARACTER, 1_000_000_000, 2, expToNext)).toStrictEqual({ ...CHARACTER, level: 2 });
  });
});
