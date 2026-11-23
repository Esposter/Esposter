import type { EnemyTables } from "#src/models/enemy/EnemyTables";

import { enemyDropFamilyKindRowSchema } from "#src/models/enemy/EnemyDropFamilyKindRow";
import { enemyDropFamilyRowSchema } from "#src/models/enemy/EnemyDropFamilyRow";
import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { enemyLevelCurvesSchema } from "#src/models/enemy/EnemyLevelCurves";
import { reactionPoiseSchema } from "#src/models/enemy/ReactionPoise";
import { readGameData } from "#src/services/data/readGameData";
import { createUniqueArraySchema, InvalidOperationError, Operation } from "@esposter/shared";

// The kinds the world places, read from the game's monster table, the drop family each kind's defeat drops from, the
// Level Curves their stats grow along and the poise each transformative reaction deals, as `pnpm -C scripts
// Genshin:assets enemies` Builds them, each fetched by its key from the hosted game data and checked against its schema
// As it arrives
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
  // A kind is joined to a drop family exactly when its drop source is one, so the read refuses a family kind in no
  // Family And a family row whose kind's article gives another source
  for (const { dropSource, id } of enemyKinds) {
    const isFamilyKind = dropSource.type === "family";
    if (enemyDropTableMap.has(id) !== isFamilyKind)
      throw new InvalidOperationError(
        Operation.Read,
        String(id),
        isFamilyKind
          ? "takes a drop family, but is in no drop family"
          : "is in a drop family its drop source does not give",
      );
  }
  return {
    enemyDropTableMap,
    enemyKindMap: new Map(enemyKinds.map((enemyKind) => [enemyKind.id, enemyKind])),
    enemyLevelCurves,
    reactionPoiseMap: new Map(reactionPoises.map((reactionPoise) => [reactionPoise.reactionType, reactionPoise])),
  };
};
