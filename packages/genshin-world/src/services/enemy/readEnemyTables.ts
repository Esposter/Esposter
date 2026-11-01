import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { reactionPoiseSchema } from "#src/models/enemy/ReactionPoise";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema } from "@esposter/shared";

// The kinds the world places, read from the game's monster table, the level curves their stats grow along and the poise
// Each transformative reaction deals, as `pnpm -C scripts genshin:assets enemies` builds them, each fetched by its key
// From the hosted game data and checked against its schema as it arrives
export const readEnemyTables = async (gameDataBaseUrl: string): Promise<EnemyTables> => {
  const [enemyKinds, enemyLevelCurves, reactionPoises] = await Promise.all([
    readGameData(gameDataBaseUrl, "enemies/kinds", createUniqueArraySchema(enemyKindSchema, "id")),
    readGameData(gameDataBaseUrl, "enemies/levelCurves", enemyLevelCurvesSchema),
    readGameData(
      gameDataBaseUrl,
      "enemies/reactionPoise",
      createUniqueArraySchema(reactionPoiseSchema, "reactionType"),
    ),
  ]);
  return {
    enemyKindMap: new Map(enemyKinds.map((enemyKind) => [enemyKind.id, enemyKind])),
    enemyLevelCurves,
    reactionPoiseMap: new Map(reactionPoises.map((reactionPoise) => [reactionPoise.reactionType, reactionPoise])),
  };
};
