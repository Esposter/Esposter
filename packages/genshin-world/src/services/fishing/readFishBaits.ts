import type { FishBait } from "#src/models/fishing/FishBait";

import { fishBaitSchema } from "#src/models/fishing/FishBait";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The baits `pnpm -C scripts genshin:assets fishing` publishes, each with the fish it draws
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFishBaits = (gameDataBaseUrl: string): Promise<FishBait[]> =>
  readGameData(gameDataBaseUrl, "fishing/baits", z.array(fishBaitSchema));
