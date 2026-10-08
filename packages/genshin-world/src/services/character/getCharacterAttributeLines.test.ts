import { CombatTalent } from "#src/models/character/CombatTalent";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { readStatTables } from "#src/services/character/readStatTables";
import { describe, expect, test } from "vitest";

describe(getCharacterAttributeLines, () => {
  const TRAVELER_ID = 10_000_007;
  const DULL_BLADE_ID = 11_101;

  test("gives the Traveler at level 90 the wiki's Max HP and DEF, and both ATK bases raised by the ascension's 24%", async () => {
    expect.hasAssertions();

    const statTables = await readStatTables();
    const attributeLines = getCharacterAttributeLines(
      {
        artifacts: [],
        ascension: 6,
        constellationCount: 0,
        friendshipExp: 0,
        id: TRAVELER_ID,
        level: 90,
        stellaFortunaCount: 0,
        talentLevels: {
          [CombatTalent.ElementalBurst]: 1,
          [CombatTalent.ElementalSkill]: 1,
          [CombatTalent.NormalAttack]: 1,
        },
        weapon: { ascension: 4, experience: 0, id: DULL_BLADE_ID, level: 70, refinement: 1 },
      },
      statTables,
    );
    const { attack, defense, maxHealth } = computeCharacterAttributes(attributeLines);

    expect({
      attack: Math.round(attack),
      defense: Number(defense.toFixed(2)),
      maxHealth: Number(maxHealth.toFixed(2)),
    }).toStrictEqual({ attack: 493, defense: 682.52, maxHealth: 10_874.91 });
  });
});
