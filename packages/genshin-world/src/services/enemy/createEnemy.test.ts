import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { STORMTERROR_SHIELD_HP_FRACTION } from "#src/services/bosses/stormterror";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
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
});
