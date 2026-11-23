import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { resinParamSchema } from "#src/models/originalResin/ResinParam";
import { readGameData } from "#src/services/data/readGameData";

// The Original Resin constants as the game's constant table holds them, read by their key from the hosted game data
export const readResinParam = (gameDataBaseUrl: string): Promise<ResinParam> =>
  readGameData(gameDataBaseUrl, "stats/resin", resinParamSchema);
