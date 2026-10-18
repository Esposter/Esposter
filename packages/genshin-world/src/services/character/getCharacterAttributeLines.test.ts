import type { Character } from "#src/models/character/Character";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { readStatTables } from "#src/services/character/readStatTables";
import { describe, expect, test } from "vitest";

describe(getCharacterAttributeLines, () => {
  const DULL_BLADE_ID = 11_101;

  const characterOf = (id: number): Character => ({
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: DULL_BLADE_ID, level: 1, refinement: 1 },
  });

  test("gives the Traveler at level 90 the wiki's Max HP and DEF, and both ATK bases raised by the ascension's 24%", async () => {
    expect.hasAssertions();

    const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
    const attributeLines = getCharacterAttributeLines(
      {
        artifacts: [],
        ascension: 6,
        constellationCount: 0,
        friendshipExp: 0,
        id: TRAVELER_CHARACTER_ID,
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

  test("the Traveler takes the bonus lines it is given, and another character does not", async () => {
    expect.hasAssertions();

    const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
    const otherId = [...statTables.characterDataMap.keys()].find((id) => id !== TRAVELER_CHARACTER_ID) ?? 0;
    const bonusLine = { attribute: Attribute.CriticalRate, value: 0.1 };

    expect(getCharacterAttributeLines(characterOf(TRAVELER_CHARACTER_ID), statTables, [bonusLine])).toContainEqual(
      bonusLine,
    );
    expect(getCharacterAttributeLines(characterOf(otherId), statTables, [bonusLine])).not.toContainEqual(bonusLine);
  });

  test("a party-wide bonus line reaches every character, not only the Traveler", async () => {
    expect.hasAssertions();

    const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
    const otherId = [...statTables.characterDataMap.keys()].find((id) => id !== TRAVELER_CHARACTER_ID) ?? 0;
    const partyBonusLine = { attribute: Attribute.AttackPercent, value: 0.2 };

    expect(
      getCharacterAttributeLines(characterOf(TRAVELER_CHARACTER_ID), statTables, [], [partyBonusLine]),
    ).toContainEqual(partyBonusLine);
    expect(getCharacterAttributeLines(characterOf(otherId), statTables, [], [partyBonusLine])).toContainEqual(
      partyBonusLine,
    );
  });
});
