import type { ExpeditionPlace } from "#src/models/expedition/ExpeditionPlace";

import { expeditionPlaceSchema } from "#src/models/expedition/ExpeditionPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's expedition places `pnpm -C scripts genshin:assets expeditions` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtExpeditionPlaces = (gameDataBaseUrl: string): Promise<ExpeditionPlace[]> =>
  readGameData(gameDataBaseUrl, "expeditions/mondstadt", z.array(expeditionPlaceSchema));
