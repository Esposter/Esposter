import type { DumpedCity } from "#src/models/genshinText/DumpedCity";
import type { DumpedChapter } from "#src/models/genshinText/DumpedChapter";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { QuestChapter, QuestReward } from "genshin-world";

import { readRewardMap } from "#src/services/genshinAssets/rewards/readRewardMap";
import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";
import {
  CARRIED_CHAPTER_IDS,
  CHAPTER_TABLE_NAME,
  CITY_TABLE_NAME,
  MAIN_QUEST_TABLE_NAME,
  MATERIAL_TABLE_NAME,
} from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { toQuestChapter } from "#src/services/genshinText/toQuestChapter";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { QuestIds } from "genshin-world";

// Each carried series, published whole: its quests in the table's order, its region by its city's name, and the rewards its
// Last quest's finish gives, each at its item's rarity. A quest of a carried series the world does not carry is an error,
// Since the series would list a quest the world never offers
export const buildQuestChapters = (): QuestChapter[] => {
  const chapterMap = new Map(
    readExcelTable<DumpedChapter>(CHAPTER_TABLE_NAME).map((chapter) => [chapter.id, chapter] as const),
  );
  const cityNameMap = new Map(
    readExcelTable<DumpedCity>(CITY_TABLE_NAME).map((city) => [city.cityId, city.cityNameTextMapHash] as const),
  );
  const mainQuests = readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME);
  const rankMap = new Map(
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME).map(({ id, rankLevel }) => [id, rankLevel] as const),
  );
  const rewardMap = readRewardMap();
  const carriedQuestIds = new Set<string>(QuestIds);
  return CARRIED_CHAPTER_IDS.map((chapterId) => {
    const chapter = chapterMap.get(chapterId);
    if (!chapter) throw new InvalidOperationError(Operation.Read, CHAPTER_TABLE_NAME, `has no chapter ${chapterId}`);
    const cityNameTextMapHash = cityNameMap.get(chapter.cityId);
    if (cityNameTextMapHash === undefined)
      throw new InvalidOperationError(Operation.Read, CITY_TABLE_NAME, `has no city ${chapter.cityId}`);
    const chapterQuests = mainQuests
      .filter(({ chapterId: questChapterId }) => questChapterId === chapterId)
      .toSorted((firstQuest, secondQuest) => firstQuest.id - secondQuest.id);
    const questIds = chapterQuests.map(({ id }) => String(id));
    const notCarriedQuestId = questIds.find((questId) => !carriedQuestIds.has(questId));
    if (notCarriedQuestId !== undefined)
      throw new InvalidOperationError(
        Operation.Read,
        CHAPTER_TABLE_NAME,
        `has quest ${notCarriedQuestId}, which the world does not carry`,
      );
    const rewards: QuestReward[] = (chapterQuests.at(-1)?.rewardIdList ?? []).flatMap((rewardId) => {
      const reward = rewardMap.get(rewardId);
      if (!reward) throw new InvalidOperationError(Operation.Read, "reward table", `has no reward ${rewardId}`);
      return toRewardItems(reward).map(({ itemCount, itemId }) => {
        const rarity = rankMap.get(itemId);
        if (rarity === undefined)
          throw new InvalidOperationError(Operation.Read, MATERIAL_TABLE_NAME, `has no item ${itemId}`);
        return { count: itemCount, itemId, rarity };
      });
    });
    return toQuestChapter(chapter, String(cityNameTextMapHash), questIds, rewards);
  });
};
