import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { describe, expect, test } from "vitest";

describe(getCharacterAttributeLines, () => {
  const TRAVELER_ID = 10_000_007;
  const DULL_BLADE_ID = 11_101;

  test("gives the Traveler at level 90 the wiki's Max HP and DEF, and both ATK bases raised by the ascension's 24%", () => {
    expect.hasAssertions();

    const { attack, defense, maxHealth } = computeCharacterAttributes(
      getCharacterAttributeLines({
        artifacts: [],
        ascension: 6,
        id: TRAVELER_ID,
        level: 90,
        weapon: { ascension: 4, id: DULL_BLADE_ID, level: 70 },
      }),
    );

    expect({
      attack: Math.round(attack),
      defense: Number(defense.toFixed(2)),
      maxHealth: Number(maxHealth.toFixed(2)),
    }).toStrictEqual({ attack: 493, defense: 682.52, maxHealth: 10_874.91 });
  });
});
