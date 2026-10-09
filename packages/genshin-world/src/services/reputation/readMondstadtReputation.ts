import type { ReputationCity } from "#src/models/reputation/ReputationCity";

import { reputationCitySchema } from "#src/models/reputation/ReputationCity";
import { readGameData } from "#src/services/data/readGameData";

// Mondstadt's Reputation `pnpm -C scripts genshin:assets reputation` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtReputation = (gameDataBaseUrl: string): Promise<ReputationCity> =>
  readGameData(gameDataBaseUrl, "reputation/mondstadt", reputationCitySchema);
