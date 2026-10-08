import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { statueLevelSchema } from "#src/models/statue/StatueLevel";
import { z } from "zod";

// Mondstadt's statue levels, the slice `pnpm -C scripts genshin:assets statues` writes, imported on demand as a chunk of
// Its own and checked against its shape as it arrives
export const readMondstadtStatueLevels = async (): Promise<StatueLevel[]> => {
  const { default: mondstadtStatueLevels } = await import("#src/generated/statueLevels/mondstadt.json");
  return z.array(statueLevelSchema).parse(mondstadtStatueLevels);
};
