import type { QuestReward } from "#src/models/quest/QuestReward";

// A series of quests the quest screen lists under one row: its title and region by text id, the journal finishing it
// Unlocks, its quests by id in the order they are done, and the items finishing it gives
export interface QuestChapter {
  id: string;
  journalTextId: string;
  questIds: string[];
  regionTextId: string;
  rewards: QuestReward[];
  titleTextId: string;
}
