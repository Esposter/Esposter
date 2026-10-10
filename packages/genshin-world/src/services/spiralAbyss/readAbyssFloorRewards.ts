import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";

import { abyssFloorRewardSchema } from "#src/models/spiralAbyss/AbyssFloorReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The floors' rewards in every reward group `pnpm -C scripts genshin:assets spiral-abyss` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readAbyssFloorRewards = (gameDataBaseUrl: string): Promise<AbyssFloorReward[]> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/rewards", z.array(abyssFloorRewardSchema));
