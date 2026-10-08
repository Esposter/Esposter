import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";

// A reward split into the Reputation EXP its nation's own item pays and every other item it gives, each as its id and count
export const toReputationReward = (
  reward: ExcelRewardRow,
  reputationItemId: number,
): { exp: number; items: { count: number; id: number }[] } => {
  const items = toRewardItems(reward);
  return {
    exp: items.find(({ itemId }) => itemId === reputationItemId)?.itemCount ?? 0,
    items: items
      .filter(({ itemId }) => itemId !== reputationItemId)
      .map(({ itemCount, itemId }) => ({ count: itemCount, id: itemId })),
  };
};
