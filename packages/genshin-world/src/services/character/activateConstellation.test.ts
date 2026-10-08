import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { activateConstellation } from "#src/services/character/activateConstellation";
import { describe, expect, test } from "vitest";

const CHARACTER: Character = {
  artifacts: [],
  ascension: 0,
  constellationCount: 2,
  id: 1,
  level: 1,
  stellaFortunaCount: 1,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
};
const CONSTELLATIONS: Constellation[] = [
  { descriptionTextId: "1", nameTextId: "1", paramList: [] },
  { descriptionTextId: "2", nameTextId: "2", paramList: [] },
  { descriptionTextId: "3", nameTextId: "3", paramList: [], raise: { levels: 3, talent: CombatTalent.ElementalBurst } },
];

describe(activateConstellation, () => {
  test("activates the next constellation and spends one Stella Fortuna", () => {
    expect.hasAssertions();

    expect(activateConstellation(CHARACTER, CONSTELLATIONS)).toStrictEqual({
      ...CHARACTER,
      constellationCount: 3,
      stellaFortunaCount: 0,
    });
  });

  test("refuses once every constellation of the set is active", () => {
    expect.hasAssertions();

    expect(() =>
      activateConstellation({ ...CHARACTER, constellationCount: 3 }, CONSTELLATIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: activateConstellation, constellation 4]`,
    );
  });

  test("refuses a character holding no Stella Fortuna, nothing taken", () => {
    expect.hasAssertions();

    expect(() =>
      activateConstellation({ ...CHARACTER, stellaFortunaCount: 0 }, CONSTELLATIONS),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: activateConstellation, a Stella Fortuna for constellation 3]`,
    );
  });

  test("refuses a character with no constellations at all", () => {
    expect.hasAssertions();

    expect(() => activateConstellation(CHARACTER, [])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: activateConstellation, constellation 3]`,
    );
  });
});
