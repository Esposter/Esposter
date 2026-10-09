import type { KitTaunt } from "#src/models/kit/KitTaunt";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_AGGRO_RANGE } from "#src/services/enemy/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { damageKitTaunt } from "#src/services/kit/effects/damageKitTaunt";
import { stepKitTaunt } from "#src/services/kit/effects/stepKitTaunt";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { selectEnemyTaunt } from "#src/services/kit/selectEnemyTaunt";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));
const createTaunt = (x: number, health: number): KitTaunt => ({
  body: { facing: 0, height: 0, position: { x, z: 0 } },
  combatant: {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  },
  explosion: {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 3 },
    hitmarkSeconds: 0,
    poiseDamage: 260,
    talentMultiplier: 1.232,
  },
  health,
  kind: "taunt",
  secondsRemaining: 5,
});

describe(selectEnemyTaunt, () => {
  test("draws an enemy to the nearest live taunt within its aggro range, and never to one whose health is gone", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.position = { x: 0, z: 0 };
    const nearTaunt = createTaunt(3, 100);
    const spentTaunt = createTaunt(1, 0);
    const outOfRangeTaunt = createTaunt(ENEMY_AGGRO_RANGE + 1, 100);

    expect(selectEnemyTaunt(enemy, [createTaunt(6, 100), spentTaunt, nearTaunt, outOfRangeTaunt])).toBe(nearTaunt);
    expect(selectEnemyTaunt(enemy, [spentTaunt, outOfRangeTaunt])).toBeUndefined();
  });

  test("draws an enemy while the taunt stands, and once its health is struck to zero it explodes and draws none", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    enemy.position = { x: 0, z: 0 };
    const taunt = createTaunt(3, 100);
    expect(selectEnemyTaunt(enemy, [taunt])).toBe(taunt);

    damageKitTaunt(taunt, 100);

    expect(stepKitTaunt(taunt)).toHaveLength(1);
    expect(selectEnemyTaunt(enemy, [taunt])).toBeUndefined();
  });
});
