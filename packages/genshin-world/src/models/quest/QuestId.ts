// Every quest the world carries, by the game's own id: the inventory `pnpm -C scripts genshin:text quests` reads, writing
// Each one's steps and talks and the words they show, so carrying a quest is a line here and a run of it. The prologue
// Begins the game, so its first quests come first
export enum QuestId {
  BirdsEyeView = "352",
  WanderersTrail = "351",
}

export const QuestIds: readonly QuestId[] = Object.values(QuestId);
