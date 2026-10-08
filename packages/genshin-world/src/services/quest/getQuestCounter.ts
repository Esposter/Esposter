import type { QuestStep } from "#src/models/quest/QuestStep";

// How far a step's first counted objective has come, as the game shows "(0/3)" after the step's line on the quest
// Screen and the HUD's tracker, "" for a step with no objective counted past one
export const getQuestCounter = ({ objectives }: QuestStep, objectiveCounts: readonly number[]): string => {
  const countedIndex = objectives.findIndex(({ count }) => count > 1);
  const counted = objectives[countedIndex];
  return counted ? `(${objectiveCounts[countedIndex] ?? 0}/${counted.count})` : "";
};
