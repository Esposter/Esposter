import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The enemy kind each monster describe a chamber lists is fought as: the one monster of that describe the regions place. A
// Describe none of whose monsters the regions place is left out, as the world has no kind to fight it as, and a describe with
// Two such monsters is an error, since only one of them can be the one fought
export const toAbyssEnemyKinds = (
  describeIds: readonly number[],
  monsterRows: readonly Pick<MonsterRow, "describeId" | "id">[],
  placedEnemyKindIds: readonly number[],
): Record<string, number> =>
  Object.fromEntries(
    [...new Set(describeIds)].flatMap((describeId) => {
      const enemyKindIds = monsterRows
        .filter((row) => row.describeId === describeId && placedEnemyKindIds.includes(row.id))
        .map(({ id }) => id);
      if (enemyKindIds.length > 1)
        throw new InvalidOperationError(
          Operation.Read,
          String(describeId),
          `is placed as ${enemyKindIds.length} kinds`,
        );
      return enemyKindIds.map((enemyKindId): [string, number] => [String(describeId), enemyKindId]);
    }),
  );
