import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { LUNAR_CONTRIBUTION_WEIGHTS, STELLAR_SWIRL_ANEMO_COEFFICIENT } from "#src/services/combat/damage/constants";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { strikeStellarReaction } from "#src/services/kit/strikeStellarReaction";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const LEVEL = 90;
const STURDY_HEALTH = 1e9;
// Sturdy, so a hit is not clamped to the health the camp member starts with
const createSturdyEnemy = () => ({
  ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
  health: STURDY_HEALTH,
  maxHealth: STURDY_HEALTH,
});

describe(strikeStellarReaction, () => {
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: LEVEL,
  };
  const kind = getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId);

  test("a Stellar Swirl's Anemo instance has a coefficient of 0.75", () => {
    expect.hasAssertions();
    const enemy = createSturdyEnemy();
    const context = createKitTestContext(combatant, { enemyTables });

    strikeStellarReaction(
      enemy,
      Element.Anemo,
      STELLAR_SWIRL_ANEMO_COEFFICIENT,
      new Set([TRAVELER_CHARACTER_ID]),
      combatant,
      context,
    );

    // The one contributor's level multiplier at the coefficient, weighted as the first place is, against the Anemo RES
    expect(enemy.maxHealth - enemy.health).toBeCloseTo(
      takeOne(CharacterLevelMultiplierMap, LEVEL) *
        0.75 *
        takeOne(LUNAR_CONTRIBUTION_WEIGHTS, 0) *
        getResistanceMultiplier(getEnemyResistance(kind, enemy, Element.Anemo)),
      6,
    );
  });
});
