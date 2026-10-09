// Every quest the world carries, by the game's own id: the inventory `pnpm -C scripts genshin:text quests` reads, writing
// Each one's steps and talks and the words they show, so carrying a quest is a line here and a run of it. The prologue
// Begins the game, so its first quests come first, in the order the Archon quests run
/* eslint-disable perfectionist/sort-enums -- the order is the order the Archon quests run, which Object.values keeps */
export enum QuestId {
  BirdsEyeView = "352",
  WanderersTrail = "351",
}
/* eslint-enable perfectionist/sort-enums */

export const QuestIds: readonly QuestId[] = Object.values(QuestId);
