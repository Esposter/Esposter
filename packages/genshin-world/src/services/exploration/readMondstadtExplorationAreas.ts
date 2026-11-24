import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { explorationAreaSchema } from "#src/models/exploration/ExplorationArea";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's exploration areas, the slice `pnpm -C scripts genshin:assets exploration` writes.
// They are fetched by its key from the hosted game data, and checked against its shape as they arrive.
export const readMondstadtExplorationAreas = (gameDataBaseUrl: string): Promise<ExplorationArea[]> =>
  readGameData(gameDataBaseUrl, "exploration/mondstadt", z.array(explorationAreaSchema));
