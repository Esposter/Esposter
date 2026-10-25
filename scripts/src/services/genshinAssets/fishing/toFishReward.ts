import type { ExcelFishRewardRow } from "#src/models/genshinAssets/fishing/ExcelFishRewardRow";
import type { FishReward } from "genshin-world";

// A blank item entry in a reward row holds item zero, so it is left out of the reward
export const toFishReward = (row: ExcelFishRewardRow): FishReward => ({
  rewardId: row.rewardId,
  rewardItemList: row.rewardItemList
    .filter((item) => item.itemId !== 0)
    .map(({ itemCount, itemId }) => ({ itemCount, itemId })),
});
