import type { WorldLevelRow } from "#src/models/adventureRank/WorldLevelRow";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { GroundPoint } from "genshin-engine";

import { createEnemy } from "#src/services/enemy/createEnemy";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The monsters of one half of a chamber, each fought as the kind the enemy kinds record names for its describe, at the
// Chamber's monster level on the disc. A describe the record names no kind for is refused
export const spawnAbyssHalf = (
  enemyTables: EnemyTables,
  worldLevelRows: readonly WorldLevelRow[],
  chamber: AbyssChamber,
  halfIndex: number,
  enemyKindIds: Readonly<Record<string, number>>,
  position: GroundPoint,
  campId: string,
): Enemy[] =>
  (chamber.halfMonsterDescribeIds[halfIndex] ?? []).map((describeId, index) => {
    const enemyKindId = enemyKindIds[describeId];
    if (enemyKindId === undefined)
      throw new InvalidOperationError(Operation.Read, String(describeId), "has no enemy kind");
    return createEnemy(
      enemyTables,
      worldLevelRows,
      { enemyKindId, id: `${campId}-${index}`, level: chamber.monsterLevel, patrol: [], position: { ...position } },
      campId,
    );
  });
