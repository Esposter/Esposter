import type { Quest } from "#src/models/quest/Quest";
import type { QuestCategory } from "#src/models/quest/QuestCategory";
import type { QuestChapter } from "#src/models/quest/QuestChapter";

import { QUEST_CATEGORIES } from "#src/services/quest/constants";
import { QuestKindCategoryMap } from "#src/services/quest/QuestKindCategoryMap";

// Each list the open tab shows, under its heading: its quests in no series, then each series holding any of its quests
// With those quests in the series' order
export const getQuestGroups = (quests: Quest[], questChapters: QuestChapter[], category: QuestCategory | undefined) =>
  (category ? [category] : QUEST_CATEGORIES)
    .map((questCategory) => {
      const categoryQuests = quests.filter(({ kind }) => QuestKindCategoryMap[kind] === questCategory);
      const chapters = questChapters
        .map((chapter) => ({
          chapter,
          chapterQuests: chapter.questIds.flatMap((questId) => categoryQuests.filter(({ id }) => id === questId)),
        }))
        .filter(({ chapterQuests }) => chapterQuests.length > 0);
      const chapterQuestIds = new Set(chapters.flatMap(({ chapter }) => chapter.questIds));
      return { chapters, questCategory, rowQuests: categoryQuests.filter(({ id }) => !chapterQuestIds.has(id)) };
    })
    .filter(({ chapters, rowQuests }) => chapters.length > 0 || rowQuests.length > 0);
