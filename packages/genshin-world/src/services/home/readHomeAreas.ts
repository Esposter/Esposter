import type { HomeArea } from "#src/models/home/HomeArea";

import { homeAreaSchema } from "#src/models/home/HomeArea";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The load each realm area holds at most, `pnpm -C scripts genshin:assets home` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readHomeAreas = (gameDataBaseUrl: string): Promise<HomeArea[]> =>
  readGameData(gameDataBaseUrl, "home/areas", z.array(homeAreaSchema));
