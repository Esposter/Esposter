import type { DumpedChapter } from "#src/models/genshinText/DumpedChapter";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

// Each quest's title and each chapter's title in the English text, to the world quest it names: a quest's title names that
// Quest, and a chapter's title names the quest its end quest is in. A title two quests share names both
export const readTitleQuestIds = (
  textMap: ReadonlyMap<string, string>,
  mainQuests: readonly Pick<DumpedMainQuest, "id" | "titleTextMapHash">[],
  chapters: readonly Pick<DumpedChapter, "chapterTitleTextMapHash" | "endQuestId">[],
  subQuestMap: ReadonlyMap<number, Pick<DumpedSubQuest, "mainId">>,
): Map<string, number[]> => {
  const titleQuestIds = new Map<string, number[]>();
  const addTitle = (titleTextMapHash: number, questId: number | undefined) => {
    const title = textMap.get(String(titleTextMapHash));
    if (title === undefined || questId === undefined) return;
    titleQuestIds.set(title, [...(titleQuestIds.get(title) ?? []), questId]);
  };
  for (const { id, titleTextMapHash } of mainQuests) addTitle(titleTextMapHash, id);
  for (const { chapterTitleTextMapHash, endQuestId } of chapters)
    addTitle(chapterTitleTextMapHash, subQuestMap.get(endQuestId)?.mainId);
  return titleQuestIds;
};
