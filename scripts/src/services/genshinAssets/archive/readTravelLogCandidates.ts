import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ExcelQuestCodexRow } from "#src/models/genshinAssets/archive/ExcelQuestCodexRow";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";

import { MAIN_QUEST_TABLE_NAME, QUEST_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The quests the Travel Log lists, each in the codex's order. A quest is named by the main quest it is filed under, whose
// Title is the one the codex's entry shows
export const readTravelLogCandidates = (): ArchiveCandidate[] => {
  const titleTextMapHashMap = new Map(
    readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME).map(({ id, titleTextMapHash }) => [id, titleTextMapHash]),
  );
  return readExcelTable<ExcelQuestCodexRow>(QUEST_CODEX_TABLE_NAME)
    .filter(({ isDisuse }) => !isDisuse)
    .flatMap(({ id, parentQuestId, sortOrder }) => {
      const nameTextMapHash = titleTextMapHashMap.get(parentQuestId);
      return nameTextMapHash === undefined ? [] : [{ id, nameTextMapHash, sortOrder }];
    });
};
