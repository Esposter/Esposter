import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { enemyDropFamilyKindRowSchema } from "#src/models/enemy/EnemyDropFamilyKindRow";
import { enemyDropFamilyRowSchema } from "#src/models/enemy/EnemyDropFamilyRow";
import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { reactionPoiseSchema } from "#src/models/enemy/ReactionPoise";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema, InvalidOperationError, Operation } from "@esposter/shared";

// The kinds the world places, read from the game's monster table, the drop family each kind's defeat drops from, the level
// Curves their stats grow along and the poise each transformative reaction deals, as `pnpm -C scripts genshin:assets enemies`
// Builds them, each fetched by its key from the hosted game data and checked against its schema as it arrives
export const readEnemyTables = async (gameDataBaseUrl: string): Promise<EnemyTables> => {
  const [enemyKinds, enemyDropFamilies, enemyDropFamilyKinds, enemyLevelCurves, reactionPoises] = await Promise.all([
    readGameData(gameDataBaseUrl, "enemies/kinds", createUniqueArraySchema(enemyKindSchema, "id")),
    readGameData(gameDataBaseUrl, "enemies/dropFamilies", createUniqueArraySchema(enemyDropFamilyRowSchema, "family")),
    readGameData(
      gameDataBaseUrl,
      "enemies/dropFamilyKinds",
      createUniqueArraySchema(enemyDropFamilyKindRowSchema, "enemyKindId"),
    ),
    readGameData(gameDataBaseUrl, "enemies/levelCurves", enemyLevelCurvesSchema),
    readGameData(
      gameDataBaseUrl,
      "enemies/reactionPoise",
      createUniqueArraySchema(reactionPoiseSchema, "reactionType"),
    ),
  ]);
  const familyDropTableMap = new Map(
    enemyDropFamilies.map(({ family, materials, mora }) => [family, { materials, mora }] as const),
  );
  return {
    enemyDropTableMap: new Map(
      enemyDropFamilyKinds.map(({ enemyKindId, family }) => {
        const dropTable = familyDropTableMap.get(family);
        if (dropTable === undefined) throw new InvalidOperationError(Operation.Read, family, "is in no drop family");
        return [enemyKindId, dropTable] as const;
      }),
    ),
    enemyKindMap: new Map(enemyKinds.map((enemyKind) => [enemyKind.id, enemyKind])),
    enemyLevelCurves,
    reactionPoiseMap: new Map(reactionPoises.map((reactionPoise) => [reactionPoise.reactionType, reactionPoise])),
  };
};
