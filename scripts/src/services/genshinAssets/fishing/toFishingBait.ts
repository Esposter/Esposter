import type { ExcelFishBaitRow } from "#src/models/genshinAssets/fishing/ExcelFishBaitRow";
import type { FishBait } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A bait with the fish it draws, read from the dump: a bait naming pools draws their fish, and a bait naming none draws
// Each fish whose feature tags hold a tag it weights. The fish are in ascending order
export const toFishingBait = (
  row: ExcelFishBaitRow,
  fishTags: ReadonlyMap<number, ReadonlySet<number>>,
  poolFishIds: ReadonlyMap<number, ReadonlySet<number>>,
): FishBait => {
  if (row.poolIdList.length > 0) {
    const fishIds = row.poolIdList.flatMap((poolId) => {
      const fish = poolFishIds.get(poolId);
      if (fish === undefined)
        throw new InvalidOperationError(Operation.Read, "fishing bait", `pool ${poolId} is not in the pool table`);
      return [...fish];
    });
    return { fishIds: [...new Set(fishIds)].toSorted((a, b) => a - b), id: row.id };
  }
  const weightedTags = new Set(row.featureList.filter(({ weight }) => weight > 0).map(({ featureTag }) => featureTag));
  const fishIds = [...fishTags]
    .filter(([, tags]) => [...tags].some((tag) => weightedTags.has(tag)))
    .map(([fishId]) => fishId);
  return { fishIds: fishIds.toSorted((a, b) => a - b), id: row.id };
};
