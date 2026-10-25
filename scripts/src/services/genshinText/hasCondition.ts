import { readQuestConditions } from "#src/services/genshinText/readQuestConditions";

// Whether a sub quest holds a condition in any of its fields, and how many of a list's sub quests do
export const hasCondition = (subQuest: Record<string, unknown>): boolean =>
  Object.values(subQuest).some((value) => readQuestConditions(value).length > 0);
