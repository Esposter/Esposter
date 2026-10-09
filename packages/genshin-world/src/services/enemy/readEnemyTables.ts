import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// The kinds the world places, read from the game's monster table, and the level curves their stats grow along, as
// `pnpm -C scripts genshin:assets enemies` builds them, each fetched by its key from the hosted game data and checked
// Against its schema as it arrives
export const readEnemyTables = async (gameDataBaseUrl: string): Promise<EnemyTables> => {
  const [enemyKinds, enemyLevelCurves] = await Promise.all([
    readGameData(gameDataBaseUrl, "enemies/kinds", createUniqueArraySchema(enemyKindSchema, "id")),
    readGameData(gameDataBaseUrl, "enemies/levelCurves", enemyLevelCurvesSchema),
  ]);
  return { enemyKindMap: new Map(enemyKinds.map((enemyKind) => [enemyKind.id, enemyKind])), enemyLevelCurves };
};
