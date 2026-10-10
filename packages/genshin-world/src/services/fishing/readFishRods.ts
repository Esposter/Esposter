import type { FishRod } from "#src/models/fishing/FishRod";

import { fishRodSchema } from "#src/models/fishing/FishRod";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The rods `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishRods = (gameDataBaseUrl: string): Promise<FishRod[]> =>
  readGameData(gameDataBaseUrl, "fishing/rods", z.array(fishRodSchema));
