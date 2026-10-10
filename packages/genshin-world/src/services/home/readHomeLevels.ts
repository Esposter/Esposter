import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { homeComfortLevelSchema } from "#src/models/home/HomeComfortLevel";
import { homeTrustLevelSchema } from "#src/models/home/HomeTrustLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Trust and Adeptal Energy ranks `pnpm -C scripts genshin:assets home` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readHomeLevels = (
  gameDataBaseUrl: string,
): Promise<{ comfort: HomeComfortLevel[]; trust: HomeTrustLevel[] }> =>
  readGameData(
    gameDataBaseUrl,
    "home/levels",
    z.object({ comfort: z.array(homeComfortLevelSchema), trust: z.array(homeTrustLevelSchema) }),
  );
