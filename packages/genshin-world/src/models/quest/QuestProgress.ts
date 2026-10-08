// How far a quest has come: the step it is on, its steps' length once every one is done, and how many times each of
// That step's objectives has been met, in the objectives' order
export interface QuestProgress {
  objectiveCounts: number[];
  stepIndex: number;
}
