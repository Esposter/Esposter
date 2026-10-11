import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";

import { frostbearingTreePlaceSchema } from "#src/models/offering/FrostbearingTreePlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's Frostbearing Tree places `pnpm -C scripts genshin:assets offerings` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtFrostbearingTreePlaces = (gameDataBaseUrl: string): Promise<FrostbearingTreePlace[]> =>
  readGameData(gameDataBaseUrl, "frostbearingTreePlaces/mondstadt", z.array(frostbearingTreePlaceSchema));
