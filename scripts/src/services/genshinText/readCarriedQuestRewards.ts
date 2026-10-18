import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { toQuestRewardItems } from "#src/services/genshinText/toQuestRewardItems";
import { QuestIds, ReputationRequestQuestIds } from "genshin-world";

// Each carried quest's reward items by its id, from its world quest's reward rows. A Reputation request's world quest is its
// Sub quest's main quest, the one its title is read from, so both the quest and the items the builders publish read it alike.
// The main and sub quest maps are the caller's, read once for the build
export const readCarriedQuestRewards = (
  mainQuestMap: ReadonlyMap<number, DumpedMainQuest>,
  subQuestMap: ReadonlyMap<number, DumpedSubQuest>,
): Map<string, { count: number; itemId: number }[]> => {
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
