import { hasCondition } from "#src/services/genshinText/hasCondition";

export const countConditioned = (subQuestList: Record<string, unknown>[]): number =>
  subQuestList.filter((subQuest) => hasCondition(subQuest)).length;
