import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { gatheringPlaceSchema } from "#src/models/gathering/GatheringPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's gathering points, fetched by their key from the hosted game data as the world opens, and checked against
// Their schema as they arrive
export const readMondstadtGatheringPlaces = (gameDataBaseUrl: string): Promise<GatheringPlace[]> =>
  readGameData(gameDataBaseUrl, "gathering/mondstadt", z.array(gatheringPlaceSchema));
