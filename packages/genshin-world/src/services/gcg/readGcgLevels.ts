import type { GcgLevels } from "#src/models/gcg/GcgLevels";

import { gcgLevelsSchema } from "#src/models/gcg/gcgLevelsSchema";
import { readGameData } from "#src/services/data/readGameData";

// The card game's levels, fetched by their key from the hosted game data when a duel first needs them, and checked against
// Their shape as they arrive
export const readGcgLevels = (gameDataBaseUrl: string): Promise<GcgLevels> =>
  readGameData(gameDataBaseUrl, "gcg/levels", gcgLevelsSchema);
