import type { AbyssRewards } from "#src/models/spiralAbyss/AbyssRewards";

import { abyssRewardsSchema } from "#src/models/spiralAbyss/AbyssRewards";
import { readGameData } from "#src/services/data/readGameData";

// The floors' rewards and the items of each reward id are published by `pnpm -C scripts genshin:assets spiral-abyss`.
// They are fetched by key from the hosted game data and checked against its shape as it arrives.
export const readAbyssFloorRewards = (gameDataBaseUrl: string): Promise<AbyssRewards> =>
  readGameData(gameDataBaseUrl, "spiralAbyss/rewards", abyssRewardsSchema);
