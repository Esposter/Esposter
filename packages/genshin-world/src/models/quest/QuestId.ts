// Every quest the world carries, by the game's own id: the inventory `pnpm -C scripts genshin:text quests` reads, writing
// Each one's steps and talks and the words they show, so carrying a quest is a line here, its place in `QuestIds` and a
// Run of it
export enum QuestId {
  BirdsEyeView = "352",
  CandidatureAnalysis = "11019",
  ForegoneConclusion = "11026",
  InazumaOpening = "7280801",
  LiyueOpening = "2211102",
  NewHorizonsOfAdventure = "22111",
  ReputationParent20740 = "20740",
  ReputationParent20741 = "20741",
  ReputationParent20743 = "20743",
  ReputationParent311 = "311",
  ReputationParent384 = "384",
  ReputationParent396 = "396",
  ReputationParent418 = "418",
  ReputationParent70061 = "70061",
  ReputationParent70078 = "70078",
  ReputationParent70102 = "70102",
  ReputationParent70104 = "70104",
  ReputationParent70106 = "70106",
  ReputationParent70108 = "70108",
  ReputationParent70121 = "70121",
  ReputationParent70123 = "70123",
  ReputationParent70141 = "70141",
  ReputationParent70801 = "70801",
  ReputationParent70810 = "70810",
  ReputationParent70812 = "70812",
  ReputationParent70813 = "70813",
  ReputationParent70821 = "70821",
  ReputationParent70824 = "70824",
  ReputationParent70825 = "70825",
  ReputationParent71012 = "71012",
  ReputationParent76096 = "76096",
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
  SumeruOpening = "7380201",
  TheSeventhSamurai = "72154",
  WanderersTrail = "351",
}

// The parent quest of each Mondstadt Reputation quest the city pays for, in the order the city reads them. Each is carried
// Whole, and a finish of it pays the reward its Reputation quest row names
const ReputationParentQuestIds: readonly QuestId[] = [
  QuestId.ReputationParent70078,
  QuestId.ReputationParent70061,
  QuestId.ReputationParent76096,
  QuestId.ReputationParent70123,
  QuestId.ReputationParent70121,
  QuestId.ReputationParent70106,
  QuestId.ReputationParent70108,
  QuestId.ReputationParent70104,
  QuestId.ReputationParent70102,
  QuestId.ReputationParent70141,
  QuestId.ReputationParent71012,
  QuestId.ReputationParent418,
  QuestId.ReputationParent70825,
  QuestId.ReputationParent70824,
  QuestId.ReputationParent70821,
  QuestId.ReputationParent70813,
  QuestId.ReputationParent70812,
  QuestId.ReputationParent70810,
  QuestId.ReputationParent70801,
  QuestId.ReputationParent20743,
  QuestId.ReputationParent20741,
  QuestId.ReputationParent20740,
  QuestId.ReputationParent396,
  QuestId.ReputationParent384,
  QuestId.ReputationParent311,
];

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
// Talk offers, the series the world carries whole, each quest in the order its series runs, then each city's opening
// Quest, which its region's commissions join the deal behind, then the Reputation quests' parents, then the Reputation
// Requests the keeper offers
export const QuestIds: readonly QuestId[] = [
  QuestId.WanderersTrail,
  QuestId.BirdsEyeView,
  QuestId.TheSeventhSamurai,
  QuestId.SevenStarSelection,
  QuestId.CandidatureAnalysis,
  QuestId.ForegoneConclusion,
  QuestId.NewHorizonsOfAdventure,
  QuestId.LiyueOpening,
  QuestId.InazumaOpening,
  QuestId.SumeruOpening,
  ...ReputationParentQuestIds,
  ...ReputationRequestQuestIds,
];
