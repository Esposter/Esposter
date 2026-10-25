import type { ExcelReputationQuestRow } from "#src/models/genshinAssets/reputation/ExcelReputationQuestRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ReputationQuest } from "genshin-world";

import { toReputationReward } from "#src/services/genshinAssets/reputation/toReputationReward";
import { readReward } from "#src/services/genshinAssets/rewards/readReward";

// A nation's Reputation quests, each bound to the quest its parent names and paying its reward once that quest finishes,
// In the order the game lists them
export const toReputationQuests = (
  rows: readonly ExcelReputationQuestRow[],
  rewardMap: Map<number, ExcelRewardRow>,
  reputationItemId: number,
): ReputationQuest[] =>
  rows
    .toSorted((firstQuest, secondQuest) => firstQuest.order - secondQuest.order)
    .map((questRow) => ({
      questId: questRow.parentQuestId,
      reward: toReputationReward(
        readReward(rewardMap, questRow.rewardId, `reputation quest ${questRow.parentQuestId}`),
        reputationItemId,
      ),
    }));
