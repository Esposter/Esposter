import type { Fish } from "#src/models/fishing/Fish";

import { fishSchema } from "#src/models/fishing/Fish";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The fish `pnpm -C scripts genshin:assets fishing` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFish = (gameDataBaseUrl: string): Promise<Fish[]> =>
  readGameData(gameDataBaseUrl, "fishing/fish", z.array(fishSchema));
