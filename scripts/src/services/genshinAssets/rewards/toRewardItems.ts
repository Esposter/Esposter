import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

// A reward row's items with the empty slots dropped, each as its item and how many of it
export const toRewardItems = ({ rewardItemList }: ExcelRewardRow): OfferingLevelRow["rewards"] =>
  rewardItemList.filter(({ itemId }) => itemId !== 0).map(({ itemCount, itemId }) => ({ itemCount, itemId }));
