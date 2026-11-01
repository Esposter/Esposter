import type { ExcelBlossomRefreshReward } from "#src/models/genshinAssets/leyLine/ExcelBlossomRefreshReward";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { OutcropKindRule } from "genshin-world";

import { toPreviewItems } from "#src/services/genshinAssets/rewards/toPreviewItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each World Level's reward row, the items of the reward preview each listed reward names, in the order it lists them
export const toWorldLevelRewards = (
  rewards: ExcelBlossomRefreshReward[],
  refreshType: string,
  rewardPreviews: ReadonlyMap<number, ExcelRewardPreviewRow>,
): OutcropKindRule["worldLevelRewards"] =>
  rewards.map(({ DANEGNOIKLH: previewId }) => {
    const rewardPreview = rewardPreviews.get(previewId);
    if (!rewardPreview)
      throw new InvalidOperationError(Operation.Read, refreshType, `has no reward preview ${previewId}`);
    return toPreviewItems(rewardPreview);
  });
