import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { enemyDropFamilyKindRowSchema } from "#src/models/enemy/EnemyDropFamilyKindRow";
import { enemyDropFamilyRowSchema } from "#src/models/enemy/EnemyDropFamilyRow";
import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { FAMILYLESS_ENEMY_KIND_IDS } from "#src/models/enemy/EnemyKindId";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { EnemyType } from "#src/models/enemy/EnemyType";
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
  const enemyDropTableMap = new Map(
    enemyDropFamilyKinds.map(({ enemyKindId, family }) => {
      const dropTable = familyDropTableMap.get(family);
      if (dropTable === undefined) throw new InvalidOperationError(Operation.Read, family, "is in no drop family");
      return [enemyKindId, dropTable] as const;
    }),
  );
  // A boss has no drop table by design, and every other kind has one unless the familyless list names it. A kind with neither
  // Is a gap in the record, and a kind with both a row the list should not name, so the read refuses either
  for (const { enemyType, id } of enemyKinds) {
    if (enemyType === EnemyType.Boss) continue;
    const isFamilyless = FAMILYLESS_ENEMY_KIND_IDS.has(id);
    if (enemyDropTableMap.has(id) === isFamilyless)
      throw new InvalidOperationError(
        Operation.Read,
        String(id),
        isFamilyless
          ? "has a drop family, so it is on no familyless list"
          : "has no drop family and is on no familyless list",
      );
  }
  return {
    enemyDropTableMap,
    enemyKindMap: new Map(enemyKinds.map((enemyKind) => [enemyKind.id, enemyKind])),
    enemyLevelCurves,
    reactionPoiseMap: new Map(reactionPoises.map((reactionPoise) => [reactionPoise.reactionType, reactionPoise])),
  };
};
