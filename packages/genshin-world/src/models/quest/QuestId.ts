// Every quest the world carries, by the game's own id: the inventory `pnpm -C scripts genshin:text quests` reads, writing
// Each one's steps and talks and the words they show, so carrying a quest is a line here, its place in `QuestIds` and a
// Run of it
export enum QuestId {
  BirdsEyeView = "352",
  CandidatureAnalysis = "11019",
  ForegoneConclusion = "11026",
  SevenStarSelection = "11018",
  TheSeventhSamurai = "72154",
  WanderersTrail = "351",
}

// The carried quests in the order the world reads them. The prologue begins the game, so its first quests come first, in
// The order the Archon quests run, which the enum's members, sorted by name, do not keep, and then the world quests a
// Talk offers, and the series the world carries whole, each quest in the order its series runs
export const QuestIds: readonly QuestId[] = [
  QuestId.WanderersTrail,
  QuestId.BirdsEyeView,
  QuestId.TheSeventhSamurai,
  QuestId.SevenStarSelection,
  QuestId.CandidatureAnalysis,
  QuestId.ForegoneConclusion,
];
