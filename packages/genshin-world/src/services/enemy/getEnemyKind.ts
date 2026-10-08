import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";

import kindsJson from "#src/data/enemies/kinds.json";
import { enemyKindSchema } from "#src/models/enemy/EnemyKind";
import { createUniqueArraySchema, InvalidOperationError, Operation } from "@esposter/shared";

// Every kind the world places, read from the game's monster table and checked against its schema as the world loads
const enemyKindMap = new Map(
  createUniqueArraySchema(enemyKindSchema, "id")
    .parse(kindsJson)
    .map((enemyKind) => [enemyKind.id, enemyKind]),
);

export const getEnemyKind = (enemyKindId: EnemyKindId): EnemyKind => {
  const enemyKind = enemyKindMap.get(enemyKindId);
  if (!enemyKind)
    throw new InvalidOperationError(Operation.Read, String(enemyKindId), "has no row in the kinds' table");
  return enemyKind;
};
