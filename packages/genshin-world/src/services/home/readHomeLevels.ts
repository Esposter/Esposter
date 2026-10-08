import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";
import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { homeComfortLevelSchema } from "#src/models/home/HomeComfortLevel";
import { homeTrustLevelSchema } from "#src/models/home/HomeTrustLevel";
import { z } from "zod";

// The Trust and Adeptal Energy ranks, the slice `pnpm -C scripts genshin:assets home` writes, imported on demand and checked
// Against its shape as it arrives
export const readHomeLevels = async (): Promise<{ comfort: HomeComfortLevel[]; trust: HomeTrustLevel[] }> => {
  const { default: levels } = await import("#src/generated/home/levels.json");
  return z.object({ comfort: z.array(homeComfortLevelSchema), trust: z.array(homeTrustLevelSchema) }).parse(levels);
};
