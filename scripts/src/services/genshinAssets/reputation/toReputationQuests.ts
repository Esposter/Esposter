import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReputationQuestRow } from "#src/models/genshinAssets/reputation/ExcelReputationQuestRow";

import { readReward } from "#src/services/genshinAssets/reputation/readReward";
import { toReputationReward } from "#src/services/genshinAssets/reputation/toReputationReward";

// A nation's Reputation quests, each bound to the quest its parent names and paying its reward once that quest finishes,
// In the order the game lists them
export const toReputationQuests = (
  rows: readonly ExcelReputationQuestRow[],
  rewardMap: Map<number, ExcelRewardRow>,
  reputationItemId: number,
): { questId: number; reward: { exp: number; items: { count: number; id: number }[] } }[] =>
  rows
    .toSorted((firstQuest, secondQuest) => firstQuest.order - secondQuest.order)
    .map((questRow) => ({
      questId: questRow.parentQuestId,
      reward: toReputationReward(
        readReward(rewardMap, questRow.rewardId, `reputation quest ${questRow.parentQuestId}`),
        reputationItemId,
      ),
    }));
