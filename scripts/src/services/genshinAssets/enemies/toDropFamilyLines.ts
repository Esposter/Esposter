import type { EnemyDropFamilyKindRow, EnemyDropFamilyRow, EnemyKind } from "genshin-world";

import { toEnemyKindName } from "#src/services/genshinAssets/enemies/toEnemyKindName";

// One line a drop family, naming the kinds it covers by their English names, for the enemies step to print before it publishes
export const toDropFamilyLines = (
  dropFamilies: readonly EnemyDropFamilyRow[],
  dropFamilyKinds: readonly EnemyDropFamilyKindRow[],
  enemyKinds: readonly Pick<EnemyKind, "id" | "nameTextId">[],
  englishTextMap: ReadonlyMap<string, string>,
): string[] =>
  dropFamilies.map(({ family }) => {
    const kindNames = enemyKinds
      .filter(({ id }) => dropFamilyKinds.some((row) => row.enemyKindId === id && row.family === family))
      .map((enemyKind) => toEnemyKindName(enemyKind, englishTextMap));
    return `${family}: ${kindNames.join(", ")}`;
  });
