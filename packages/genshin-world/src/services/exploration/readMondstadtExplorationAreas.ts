import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { explorationAreaSchema } from "#src/models/exploration/ExplorationArea";
import { z } from "zod";

// Mondstadt's exploration areas, the slice `pnpm -C scripts genshin:assets exploration` writes, imported on demand as a
// Chunk of its own and checked against its shape as it arrives
export const readMondstadtExplorationAreas = async (): Promise<ExplorationArea[]> => {
  const { default: mondstadtExplorationAreas } = await import("#src/generated/exploration/mondstadt.json");
  return z.array(explorationAreaSchema).parse(mondstadtExplorationAreas);
};
