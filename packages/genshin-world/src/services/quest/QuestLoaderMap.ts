import type { QuestId } from "#src/models/quest/QuestId";

import { QuestId as QuestIdValues } from "#src/models/quest/QuestId";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Each carried quest's table, the slice `pnpm -C scripts genshin:text quests` writes, fetched by its key from the hosted
// Game data. Typed over every QuestId, so a quest carried without its loader does not typecheck
export const QuestLoaderMap: Record<QuestId, (gameDataBaseUrl: string) => Promise<unknown>> = {
  [QuestIdValues.BirdsEyeView]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/352", z.unknown()),
  [QuestIdValues.CandidatureAnalysis]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/11019", z.unknown()),
  [QuestIdValues.ForegoneConclusion]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/11026", z.unknown()),
  [QuestIdValues.InazumaOpening]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/7280801", z.unknown()),
  [QuestIdValues.LiyueOpening]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/2211102", z.unknown()),
  [QuestIdValues.NewHorizonsOfAdventure]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/22111", z.unknown()),
  [QuestIdValues.ReputationParent20740]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/20740", z.unknown()),
  [QuestIdValues.ReputationParent20741]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/20741", z.unknown()),
  [QuestIdValues.ReputationParent20743]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/20743", z.unknown()),
  [QuestIdValues.ReputationParent384]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/384", z.unknown()),
  [QuestIdValues.ReputationParent396]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/396", z.unknown()),
  [QuestIdValues.ReputationParent70102]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70102", z.unknown()),
  [QuestIdValues.ReputationParent70104]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70104", z.unknown()),
  [QuestIdValues.ReputationParent70106]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70106", z.unknown()),
  [QuestIdValues.ReputationParent70108]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70108", z.unknown()),
  [QuestIdValues.ReputationParent70121]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70121", z.unknown()),
  [QuestIdValues.ReputationParent70123]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70123", z.unknown()),
  [QuestIdValues.ReputationParent70141]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70141", z.unknown()),
  [QuestIdValues.ReputationParent70801]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70801", z.unknown()),
  [QuestIdValues.ReputationParent70810]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70810", z.unknown()),
  [QuestIdValues.ReputationParent70812]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70812", z.unknown()),
  [QuestIdValues.ReputationParent70813]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70813", z.unknown()),
  [QuestIdValues.ReputationParent70821]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70821", z.unknown()),
  [QuestIdValues.ReputationParent70824]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70824", z.unknown()),
  [QuestIdValues.ReputationParent70825]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/70825", z.unknown()),
  [QuestIdValues.ReputationParent71012]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/71012", z.unknown()),
  [QuestIdValues.ReputationRequest7070001]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070001", z.unknown()),
  [QuestIdValues.ReputationRequest7070101]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070101", z.unknown()),
  [QuestIdValues.ReputationRequest7070201]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070201", z.unknown()),
  [QuestIdValues.ReputationRequest7070301]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070301", z.unknown()),
  [QuestIdValues.ReputationRequest7070401]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070401", z.unknown()),
  [QuestIdValues.ReputationRequest7070501]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070501", z.unknown()),
  [QuestIdValues.ReputationRequest7070601]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070601", z.unknown()),
  [QuestIdValues.ReputationRequest7070701]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070701", z.unknown()),
  [QuestIdValues.ReputationRequest7070801]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070801", z.unknown()),
  [QuestIdValues.ReputationRequest7070901]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7070901", z.unknown()),
  [QuestIdValues.ReputationRequest7071001]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071001", z.unknown()),
  [QuestIdValues.ReputationRequest7071101]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071101", z.unknown()),
  [QuestIdValues.ReputationRequest7071201]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071201", z.unknown()),
  [QuestIdValues.ReputationRequest7071301]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071301", z.unknown()),
  [QuestIdValues.ReputationRequest7071401]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071401", z.unknown()),
  [QuestIdValues.SevenStarSelection]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/11018", z.unknown()),
  [QuestIdValues.SumeruOpening]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/7380201", z.unknown()),
  [QuestIdValues.TheSeventhSamurai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/72154", z.unknown()),
  [QuestIdValues.WanderersTrail]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/351", z.unknown()),
};
