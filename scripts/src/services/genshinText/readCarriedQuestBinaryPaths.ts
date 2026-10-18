import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import { QUEST_BINARY_DIRECTORY_PATH } from "#src/services/genshinText/constants";
import { readCarriedMainQuestId } from "#src/services/genshinText/readCarriedMainQuestId";

// The binary each carried quest's steps are read from, by its path under the dump: the binary of its main quest, named by
// That quest's id. A quest with no row is left out, and the reader that builds it names the row it lacks
export const readCarriedQuestBinaryPaths = (
  questIds: readonly string[],
  mainQuests: readonly Pick<DumpedMainQuest, "id">[],
  subQuests: readonly Pick<DumpedSubQuest, "mainId" | "subId">[],
): string[] => {
  const mainQuestIds = new Set(mainQuests.map(({ id }) => id));
  const mainIdBySubId = new Map(subQuests.map(({ mainId, subId }) => [subId, mainId] as const));
  return [
    ...new Set(
      questIds.flatMap((questId) => {
        const mainQuestId = readCarriedMainQuestId(Number(questId), mainQuestIds, mainIdBySubId);
        return mainQuestId === undefined ? [] : [`${QUEST_BINARY_DIRECTORY_PATH}/${mainQuestId}.json`];
      }),
    ),
  ];
};
