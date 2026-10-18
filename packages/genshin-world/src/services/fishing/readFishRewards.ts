import type { FishReward } from "#src/models/fishing/FishReward";

import { fishRewardSchema } from "#src/models/fishing/FishReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The catch rewards `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishRewards = (gameDataBaseUrl: string): Promise<FishReward[]> =>
  readGameData(gameDataBaseUrl, "fishing/rewards", z.array(fishRewardSchema));
