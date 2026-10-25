import { checkHasCondition } from "#src/services/genshinText/checkHasCondition";

export const countConditioned = (subQuestList: Record<string, unknown>[]): number =>
  subQuestList.filter((subQuest) => checkHasCondition(subQuest)).length;
