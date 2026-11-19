import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { selectDrawnEnemies } from "#src/services/enemy/selectDrawnEnemies";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
// An enemy standing the given distance along x from the character, under the id given
const createEnemyAt = (id: string, x: number) =>
  createEnemy(enemyTables, [], { ...ENEMY_CAMP_MEMBER, id, position: { x, z: 0 } }, "");

describe(selectDrawnEnemies, () => {
  const CHARACTER_POINT = { x: 0, z: 0 };

  test("an enemy beside the character is drawn when more are loaded than the draw holds", () => {
    expect.hasAssertions();
    const enemies = [createEnemyAt("far", 10), createEnemyAt("beside", 1), createEnemyAt("farther", 12)];

    expect(selectDrawnEnemies(enemies, CHARACTER_POINT, 2).map(({ id }) => id)).toStrictEqual(["beside", "far"]);
  });

  test("the draw holds the nearest enemies nearest first, whatever order the map holds them in", () => {
    expect.hasAssertions();
    const enemies = [7, 2, 9, 1, 4, 3, 8, 5, 6].map((x) => createEnemyAt(`x${x}`, x));

    expect(selectDrawnEnemies(enemies, CHARACTER_POINT, 4).map(({ id }) => id)).toStrictEqual(["x1", "x2", "x3", "x4"]);
  });

  test("with no character in the world, the map's order decides which enemies are drawn", () => {
    expect.hasAssertions();
    const enemies = [createEnemyAt("first", 10), createEnemyAt("second", 1)];

    expect(selectDrawnEnemies(enemies, undefined, 1).map(({ id }) => id)).toStrictEqual(["first"]);
  });
});
