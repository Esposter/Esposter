import type { FishingPool } from "#src/models/fishing/FishingPool";

import { fishingPoolSchema } from "#src/models/fishing/FishingPool";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The fishing pools of each region `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishingPools = (gameDataBaseUrl: string): Promise<Record<string, FishingPool[]>> =>
  readGameData(gameDataBaseUrl, "fishing/pools", z.record(z.string(), z.array(fishingPoolSchema)));
