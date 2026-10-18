import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { MAIN_QUEST_TABLE_NAME, SUB_QUEST_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { toQuestRewardItems } from "#src/services/genshinText/toQuestRewardItems";
import { QuestIds, ReputationRequestQuestIds } from "genshin-world";

// Each carried quest's reward items by its id, from its world quest's reward rows. A Reputation request's world quest is its
// Sub quest's main quest, the one its title is read from, so both the quest and the items the builders publish read it alike
export const readCarriedQuestRewards = (): Map<string, { count: number; itemId: number }[]> => {
  const mainQuestMap = new Map(
    readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME).map((mainQuest) => [mainQuest.id, mainQuest] as const),
  );
  const subQuestMap = new Map(
    readExcelTable<DumpedSubQuest>(SUB_QUEST_TABLE_NAME).map((subQuest) => [subQuest.subId, subQuest] as const),
  );
  const rewardMap = readRewardMap();
  return new Map(
    QuestIds.map((questId) => {
      const worldQuestId = ReputationRequestQuestIds.includes(questId)
        ? subQuestMap.get(Number(questId))?.mainId
        : Number(questId);
      const mainQuest = worldQuestId === undefined ? undefined : mainQuestMap.get(worldQuestId);
      return [questId, toQuestRewardItems(mainQuest?.rewardIdList ?? [], rewardMap)] as const;
    }),
  );
};
