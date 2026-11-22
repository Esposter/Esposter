import type { MatSet } from "#src/models/genshinAssets/enemies/MatSet";
import type { EnemyMaterialDrop } from "genshin-world";

import { toMaterialItemId } from "#src/services/genshinAssets/enemies/toMaterialItemId";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const toMaterialDrops = (
  dropFamily: string,
  { fixed, names, nums }: MatSet,
  nameItemIdsMap: ReadonlyMap<string, number[]>,
): EnemyMaterialDrop[] => {
  if (fixed !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      dropFamily,
      "has a material of a fixed count, which no drop table models",
    );
  if (!Array.isArray(names) || !Array.isArray(nums) || names.length !== nums.length)
    throw new InvalidOperationError(
      Operation.Read,
      dropFamily,
      "has a material set whose names and counts do not pair up",
    );
  return names.map((name, tier) => ({
    expectedCount: takeOne(nums, tier),
    itemId: toMaterialItemId(name, nameItemIdsMap),
    tier,
  }));
};
