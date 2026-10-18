import type { DumpedSubQuest } from "#src/models/genshinText/DumpedSubQuest";

import { readQuestConditions } from "#src/services/genshinText/readQuestConditions";

// The dump's state code for a quest a condition checks as finished
const FINISHED_QUEST_STATE = "3";

// The world quests a quest waits on, read from the accept conditions its sub quests hold: a condition naming a sub quest of
// Another quest, finished. A condition on the quest's own sub quests is no wait, and one that asks any other state is not
// Carried. Each parent is named once, by its world quest's number, whether or not the world carries it
export const readParentQuestIds = (
  questBinary: Record<string, unknown>,
  questId: number,
  subQuestMap: ReadonlyMap<number, Pick<DumpedSubQuest, "mainId">>,
): number[] => {
  const parentQuestIds = Object.values(questBinary)
    .flatMap((field) =>
      Array.isArray(field)
        ? field.flatMap((item: unknown) =>
            typeof item === "object" && item !== null
              ? Object.values(item).flatMap((value) => readQuestConditions(value, "QUEST_COND_"))
              : [],
          )
        : [],
    )
    .flatMap(({ parameters, type }) => {
      if (type !== "QUEST_COND_STATE_EQUAL" || String(parameters[1]) !== FINISHED_QUEST_STATE) return [];
      const parentQuestId = subQuestMap.get(Number(parameters[0]))?.mainId;
      return parentQuestId === undefined || parentQuestId === questId ? [] : [parentQuestId];
    });
  return [...new Set(parentQuestIds)];
};
