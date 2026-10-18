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
  [QuestIdValues.SevenStarSelection]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/11018", z.unknown()),
  [QuestIdValues.TheSeventhSamurai]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/72154", z.unknown()),
  [QuestIdValues.WanderersTrail]: (gameDataBaseUrl) => readGameData(gameDataBaseUrl, "quests/351", z.unknown()),
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
  [QuestIdValues.ReputationRequest7071201]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071201", z.unknown()),
  [QuestIdValues.ReputationRequest7071301]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071301", z.unknown()),
  [QuestIdValues.ReputationRequest7071401]: (gameDataBaseUrl) =>
    readGameData(gameDataBaseUrl, "quests/7071401", z.unknown()),
};
