import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { homeTrustLevelSchema } from "#src/models/home/HomeTrustLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Trust Ranks `pnpm -C scripts genshin:assets home` publishes, read from the levels record their Adeptal Energy ranks
// Share. Fetched by its key from the hosted game data and checked against their shape as they arrive
export const readHomeTrustLevels = async (gameDataBaseUrl: string): Promise<HomeTrustLevel[]> => {
  const levels = await readGameData(gameDataBaseUrl, "home/levels", z.object({ trust: z.array(homeTrustLevelSchema) }));
  return levels.trust;
};
