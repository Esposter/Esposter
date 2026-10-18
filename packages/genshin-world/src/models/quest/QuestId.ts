// Every quest the world carries, by the game's own id: the inventory `pnpm -C scripts genshin:text quests` reads, writing
// Each one's steps and talks and the words they show, so carrying a quest is a line here, its place in `QuestIds` and a
// Run of it
export enum QuestId {
  BirdsEyeView = "352",
  CandidatureAnalysis = "11019",
  ForegoneConclusion = "11026",
  ReputationRequest7070001 = "7070001",
  ReputationRequest7070101 = "7070101",
  ReputationRequest7070201 = "7070201",
  ReputationRequest7070301 = "7070301",
  ReputationRequest7070401 = "7070401",
  ReputationRequest7070501 = "7070501",
  ReputationRequest7070601 = "7070601",
  ReputationRequest7070701 = "7070701",
  ReputationRequest7070801 = "7070801",
  ReputationRequest7071201 = "7071201",
  ReputationRequest7071301 = "7071301",
  ReputationRequest7071401 = "7071401",
  SevenStarSelection = "11018",
  TheSeventhSamurai = "72154",
  WanderersTrail = "351",
}

// The Mondstadt keeper's delivery requests, each a sub quest its request row names. The three camp requests are not
// Carried: their camps' targets are not in the tables the quest reader takes
export const ReputationRequestQuestIds: readonly QuestId[] = [
  QuestId.ReputationRequest7070001,
  QuestId.ReputationRequest7070101,
  QuestId.ReputationRequest7070201,
  QuestId.ReputationRequest7070301,
  QuestId.ReputationRequest7070401,
  QuestId.ReputationRequest7070501,
  QuestId.ReputationRequest7070601,
  QuestId.ReputationRequest7070701,
  QuestId.ReputationRequest7070801,
  QuestId.ReputationRequest7071201,
  QuestId.ReputationRequest7071301,
  QuestId.ReputationRequest7071401,
];

// The carried quests in the order the world reads them. The prologue begins the game, so its first quests come first, in
// The order the Archon quests run, which the enum's members, sorted by name, do not keep, then the world quests a
// Talk offers, the series the world carries whole, each quest in the order its series runs, then the Reputation
// Requests the keeper offers
export const QuestIds: readonly QuestId[] = [
  QuestId.WanderersTrail,
  QuestId.BirdsEyeView,
  QuestId.TheSeventhSamurai,
  QuestId.SevenStarSelection,
  QuestId.CandidatureAnalysis,
  QuestId.ForegoneConclusion,
  ...ReputationRequestQuestIds,
];
