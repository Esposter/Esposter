import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";

import { explorationAreaSchema } from "#src/models/exploration/ExplorationArea";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's exploration areas, the slice `pnpm -C scripts genshin:assets exploration` writes, fetched by its key from the
// Hosted game data and checked against its shape as it arrives
export const readMondstadtExplorationAreas = (gameDataBaseUrl: string): Promise<ExplorationArea[]> =>
  readGameData(gameDataBaseUrl, "exploration/mondstadt", z.array(explorationAreaSchema));
