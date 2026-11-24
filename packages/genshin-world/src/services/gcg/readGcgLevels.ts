import type { GcgLevels } from "#src/models/gcg/GcgLevels";

import { gcgLevelsSchema } from "#src/models/gcg/gcgLevelsSchema";
import { readGameData } from "#src/services/data/readGameData";

// The card game's levels are fetched by their key from the hosted game data when a duel first needs them.
// They are checked against their shape as they arrive.
export const readGcgLevels = (gameDataBaseUrl: string): Promise<GcgLevels> =>
  readGameData(gameDataBaseUrl, "gcg/levels", gcgLevelsSchema);
