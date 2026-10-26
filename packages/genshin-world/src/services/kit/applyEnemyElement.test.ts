import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { applyEnemyElement } from "#src/services/kit/applyEnemyElement";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(applyEnemyElement, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  test.each<[Element, Element, boolean, boolean]>([
    [Element.Hydro, Element.Electro, true, false],
    [Element.Electro, Element.Hydro, true, false],
    [Element.Dendro, Element.Pyro, false, true],
    [Element.Pyro, Element.Dendro, false, true],
    [Element.Hydro, Element.Pyro, false, false],
  ])(
    "on a %s enemy, makes the combatant whose %s lands the one Electro-Charged is priced from: %s, and Burning: %s",
    (aura, element, isCharged, isBurning) => {
      expect.hasAssertions();

      const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
      applyElement(enemy.elementalState, aura, 1, { auraDecayRateScale: 1 });
      applyEnemyElement(enemy, element, 1, combatant);

      expect([enemy.electroChargedCombatant, enemy.burningCombatant]).toStrictEqual([
        isCharged ? combatant : undefined,
        isBurning ? combatant : undefined,
      ]);
    },
  );
});
