import type { HomeFurnishing } from "#src/models/home/HomeFurnishing";

import { homeFurnishingSchema } from "#src/models/home/HomeFurnishing";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The load each furnishing takes up in its area, `pnpm -C scripts genshin:assets home` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readHomeFurnishings = (gameDataBaseUrl: string): Promise<HomeFurnishing[]> =>
  readGameData(gameDataBaseUrl, "home/furnishings", z.array(homeFurnishingSchema));
