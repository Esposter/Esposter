import type { TrialAvatar } from "#src/models/trial/TrialAvatar";
import type { TrialBuild } from "#src/models/trial/TrialBuild";
import type { TrialReliquary } from "#src/models/trial/TrialReliquary";
import type { TrialReward } from "#src/models/trial/TrialReward";
import type { TrialStage } from "#src/models/trial/TrialStage";
import type { TrialTemplate } from "#src/models/trial/TrialTemplate";

import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The character trials' published tables: the trial avatars, builds, reliquaries, first-clear rewards, stages and templates
export interface CharacterTrialTables {
  avatars: Record<string, TrialAvatar>;
  builds: Record<string, TrialBuild>;
  reliquaries: Record<string, TrialReliquary>;
  rewards: Record<string, TrialReward[]>;
  stages: Record<string, TrialStage>;
  templates: TrialTemplate[];
}

const trialAvatarSchema = z.object({
  characterId: z.int().positive(),
  level: z.int().positive(),
  trialAvatarId: z.int().positive(),
}) satisfies z.ZodType<TrialAvatar>;
const trialBuildSchema = z.object({
  characterId: z.int().positive(),
  constellation: z.int().nonnegative(),
  refinement: z.int().positive(),
  weaponId: z.int().positive(),
}) satisfies z.ZodType<TrialBuild>;
const trialReliquarySchema = z.object({
  appendPropIds: z.array(z.int().positive()),
  id: z.int().positive(),
  level: z.int().positive(),
  mainPropId: z.int().positive(),
  reliquaryId: z.int().positive(),
}) satisfies z.ZodType<TrialReliquary>;
const trialRewardSchema = z.object({
  count: z.int().positive(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<TrialReward>;
const trialStageSchema = z.object({
  dungeonId: z.int().positive(),
  id: z.int().positive(),
  rewardId: z.int().positive(),
  trialAvatarId: z.int().positive(),
  trialAvatarIndexId: z.int().nonnegative(),
}) satisfies z.ZodType<TrialStage>;
const trialTemplateSchema = z.object({
  level: z.int().positive(),
  reliquaryIds: z.array(z.int().positive()),
  talentLevel: z.int().positive(),
}) satisfies z.ZodType<TrialTemplate>;

// Each table fetched by its key from the hosted game data and checked against its shape as it arrives
export const readCharacterTrials = async (gameDataBaseUrl: string): Promise<CharacterTrialTables> => {
  const [avatars, builds, reliquaries, rewards, stages, templates] = await Promise.all([
    readGameData(gameDataBaseUrl, "characterTrials/avatars", z.record(z.string(), trialAvatarSchema)),
    readGameData(gameDataBaseUrl, "characterTrials/builds", z.record(z.string(), trialBuildSchema)),
    readGameData(gameDataBaseUrl, "characterTrials/reliquaries", z.record(z.string(), trialReliquarySchema)),
    readGameData(gameDataBaseUrl, "characterTrials/rewards", z.record(z.string(), z.array(trialRewardSchema))),
    readGameData(gameDataBaseUrl, "characterTrials/stages", z.record(z.string(), trialStageSchema)),
    readGameData(gameDataBaseUrl, "characterTrials/templates", z.array(trialTemplateSchema)),
  ]);
  return { avatars, builds, reliquaries, rewards, stages, templates };
};
