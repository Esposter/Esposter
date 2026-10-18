import type { Character } from "#src/models/character/Character";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { addStellaFortuna } from "#src/services/character/addStellaFortuna";
import { describe, expect, test } from "vitest";

const createCharacter = (id: number): Character => ({
  artifacts: [],
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
});

describe(addStellaFortuna, () => {
  const CHARACTER = createCharacter(1);
  const OTHER_CHARACTER = createCharacter(2);

  test("a duplicate draw adds its Stella Fortuna to the character at once", () => {
    expect.hasAssertions();

    expect(addStellaFortuna([CHARACTER, OTHER_CHARACTER], new Map([[CHARACTER.id, 1]]))).toStrictEqual([
      { ...CHARACTER, stellaFortunaCount: 1 },
      OTHER_CHARACTER,
    ]);
  });
});
