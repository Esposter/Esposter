import type { DumpFile } from "#src/models/genshinText/DumpFile";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import {
  MAIN_QUEST_TABLE_NAME,
  QUEST_BINARY_DIRECTORY_PATH,
  SUB_QUEST_TABLE_NAME,
} from "#src/services/genshinText/constants";
import { readCarriedQuestBinaryPaths } from "#src/services/genshinText/readCarriedQuestBinaryPaths";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { QuestIds, ReputationRequestQuestIds } from "genshin-world";

// The binary each quest the reader carries reads, found in the folder's listing. The main and sub quest tables it is
// Named by are the ones the first pass brought down, so this runs after it. A binary the folder lacks is named in
// The error
export const listCarriedQuestBinaryFiles = (questListing: readonly DumpFile[]): DumpFile[] => {
  const requestedPaths = new Set(
    readCarriedQuestBinaryPaths(
      QuestIds.filter((questId) => !ReputationRequestQuestIds.includes(questId)),
      readExcelTable<DumpedMainQuest>(MAIN_QUEST_TABLE_NAME),
      readExcelTable<DumpedSubQuest>(SUB_QUEST_TABLE_NAME),
    ),
  );
  const listedPaths = new Set(questListing.map(({ path }) => path));
  const missingPaths = [...requestedPaths].filter((path) => !listedPaths.has(path));
  if (missingPaths.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      QUEST_BINARY_DIRECTORY_PATH,
      `has no binary for ${missingPaths.join(", ")} in AnimeGameData`,
    );
  return questListing.filter(({ path }) => requestedPaths.has(path));
};
