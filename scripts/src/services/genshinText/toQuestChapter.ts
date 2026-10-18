import type { DumpedChapter } from "#src/models/genshinText/DumpedChapter";
import type { QuestChapter } from "genshin-world";

// A chapter row as the world's series: its title and its journal are the one title, and its number is listed beside
// It, "" for a chapter with none. Its region is the city's name, and its quests and rewards are given by the builder
export const toQuestChapter = (
  { chapterNumTextMapHash, chapterTitleTextMapHash, id }: DumpedChapter,
  regionTextId: string,
  questIds: string[],
  rewards: QuestChapter["rewards"],
): QuestChapter => ({
  id: String(id),
  journalTextId: String(chapterTitleTextMapHash),
  numberTextId: chapterNumTextMapHash === 0 ? "" : String(chapterNumTextMapHash),
  questIds,
  regionTextId,
  rewards,
  titleTextId: String(chapterTitleTextMapHash),
});
