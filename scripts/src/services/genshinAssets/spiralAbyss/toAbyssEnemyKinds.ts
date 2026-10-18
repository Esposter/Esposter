import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

// The enemy kind each monster describe a chamber lists is fought as: its base variant, the monster of that describe with the
// Lowest id. A describe with no monster row is left out, as the world has no kind to fight it as
export const toAbyssEnemyKinds = (
  describeIds: readonly number[],
  monsterRows: readonly Pick<MonsterRow, "describeId" | "id">[],
): Record<string, number> =>
  Object.fromEntries(
    [...new Set(describeIds)].flatMap((describeId): [string, number][] => {
      const baseEnemyKindId = Math.min(
        ...monsterRows.filter((row) => row.describeId === describeId).map(({ id }) => id),
      );
      return Number.isFinite(baseEnemyKindId) ? [[String(describeId), baseEnemyKindId]] : [];
    }),
  );
