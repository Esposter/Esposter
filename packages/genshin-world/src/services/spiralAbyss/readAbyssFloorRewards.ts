import type { AbyssRewards } from "#src/models/spiralAbyss/AbyssRewards";

import { abyssRewardsSchema } from "#src/models/spiralAbyss/AbyssRewards";
import { readGameData } from "#src/services/data/readGameData";

// The floors' rewards and the items of each reward id `pnpm -C scripts genshin:assets spiral-abyss` publishes, fetched by its
// Key from the hosted game data and checked against its shape as it arrives
export const readAbyssFloorRewards = (gameDataBaseUrl: string): Promise<AbyssRewards> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/rewards", abyssRewardsSchema);
