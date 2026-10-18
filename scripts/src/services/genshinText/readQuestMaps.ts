import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import { MAIN_QUEST_TABLE_NAME, SUB_QUEST_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The main quest and sub quest tables from the dump, each keyed by its id
export const readQuestMaps = (): {
  mainQuestMap: Map<number, DumpedMainQuest>;
  subQuestMap: Map<number, DumpedSubQuest>;
} => ({
  mainQuestMap: new Map(
    readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME).map((mainQuest) => [mainQuest.id, mainQuest] as const),
  ),
  subQuestMap: new Map(
    readExcelTable<DumpedSubQuest>(SUB_QUEST_TABLE_NAME).map((subQuest) => [subQuest.subId, subQuest] as const),
  ),
});
