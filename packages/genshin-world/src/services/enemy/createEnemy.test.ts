import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnemyKindMovesLoaderMap } from "#src/services/bosses/EnemyKindMovesLoaderMap";
import { STORMTERROR_SHIELD_HP_FRACTION } from "#src/services/bosses/stormterror";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { displaceEnemy } from "#src/services/enemy/displaceEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createEnemy, () => {
  test("builds Stormterror from its kinds row, with a shield a fifth of its max HP", () => {
    expect.hasAssertions();

    const enemy = createEnemy(
      enemyTables,
      [],
      { ...ENEMY_CAMP_MEMBER, enemyKindId: EnemyKindId.StormterrorDvalin },
      "",
    );
    const shieldHealth = enemy.maxHealth * STORMTERROR_SHIELD_HP_FRACTION;

    expect(enemy.shield).toStrictEqual({ health: shieldHealth, maxHealth: shieldHealth });
  });

  test("gives an enemy whose kind has no shield none", () => {
    expect.hasAssertions();

    expect(createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "").shield).toBeUndefined();
  });

  // Every boss written that the published kinds hold, so a boss a camp or a fight does not place yet is not checked
  const BOSS_KIND_IDS = Object.values(EnemyKindId).filter(
    (enemyKindId) => EnemyKindMovesLoaderMap[enemyKindId] !== undefined && enemyTables.enemyKindMap.has(enemyKindId),
  );

  test.each(BOSS_KIND_IDS)("a boss of kind %s spawns immune to Frozen and resists displacement", (enemyKindId) => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, enemyKindId }, "");

    expect(enemy.elementalState.isFrozenImmune).toBe(true);
    expect(
      displaceEnemy(getEnemyKind(enemyTables.enemyKindMap, enemyKindId).enemyType, enemy.position, { x: 0.1, z: -1 }),
    ).toStrictEqual(enemy.position);
  });

  test("a common enemy spawns open to Frozen and displacement", () => {
    expect.hasAssertions();

    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

    expect(enemy.elementalState.isFrozenImmune).toBe(false);
    expect(
      displaceEnemy(getEnemyKind(enemyTables.enemyKindMap, ENEMY_CAMP_MEMBER.enemyKindId).enemyType, enemy.position, {
        x: 0.1,
        z: -1,
      }),
    ).toStrictEqual({ x: 0.1, z: -1 });
  });
});
