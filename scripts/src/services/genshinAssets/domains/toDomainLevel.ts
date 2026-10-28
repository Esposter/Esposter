import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { DomainLevel, RewardItem, TreeArtifact } from "genshin-world";

import { getPreview } from "#src/services/genshinAssets/domains/getPreview";
import { toWholeRewards } from "#src/services/genshinAssets/domains/toWholeRewards";

export const toDomainLevel = (
  dungeon: ExcelDungeonRow,
  scheduledDaysOfWeek: readonly number[],
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
  bookRewards: RewardItem[],
  treeArtifacts: TreeArtifact[],
  disorder: string,
): DomainLevel => ({
  disorder,
  dungeonId: dungeon.id,
  enemyLevel: dungeon.levelRevise,
  recommendedRank: dungeon.limitLevel,
  resinCost: dungeon.statueCostCount,
  scheduledDaysOfWeek: [...scheduledDaysOfWeek],
  treeArtifacts,
  treeRewards: [...toWholeRewards(getPreview(previewMap, dungeon)), ...bookRewards],
});
