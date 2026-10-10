import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringLevelSchema } from "#src/models/offering/OfferingLevel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Frostbearing Tree's levels `pnpm -C scripts genshin:assets offerings` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readFrostbearingTreeLevels = (gameDataBaseUrl: string): Promise<OfferingLevel[]> =>
  readGameData(gameDataBaseUrl, "offerings/frostbearingTree", z.array(offeringLevelSchema));
