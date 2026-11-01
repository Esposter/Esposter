import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { describe } from "vitest";

export const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

export const createTestEnemy = () => createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

describe.todo("createTestEnemy");
