// What the world's own state reads for the quests that wait on it: the clock's days and its minute of the day, and the
// Scene the player is in by the game's id, "" in a place that names none
export interface QuestState {
  days: number;
  minutes: number;
  sceneId: string;
}
