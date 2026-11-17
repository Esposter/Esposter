import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";

import { homeComfortLevelSchema } from "#src/models/home/HomeComfortLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Adeptal Energy ranks `pnpm -C scripts genshin:assets home` publishes, read from the levels record their Trust Ranks
// Share. Fetched by its key from the hosted game data and checked against their shape as they arrive
export const readHomeComfortLevels = async (gameDataBaseUrl: string): Promise<HomeComfortLevel[]> => {
  const levels = await readGameData(
    gameDataBaseUrl,
    "home/levels",
    z.object({ comfort: z.array(homeComfortLevelSchema) }),
  );
  return levels.comfort;
};
