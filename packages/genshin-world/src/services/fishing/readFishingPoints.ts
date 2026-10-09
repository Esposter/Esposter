import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { fishingPointPlaceSchema } from "#src/models/fishing/FishingPointPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The fishing points of each region `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishingPoints = (gameDataBaseUrl: string): Promise<Record<string, FishingPointPlace[]>> =>
  readGameData(gameDataBaseUrl, "fishing/points", z.record(z.string(), z.array(fishingPointPlaceSchema)));
