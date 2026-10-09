import type { TransPointReward } from "#src/models/transPoint/TransPointReward";

import { transPointRewardSchema } from "#src/models/transPoint/TransPointReward";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The open world's transport point rewards, the slice `pnpm -C scripts genshin:assets trans-points` writes, fetched by
// Its key from the hosted game data and checked against its shape as it arrives
export const readOpenWorldTransPointRewards = (gameDataBaseUrl: string): Promise<TransPointReward[]> =>
  readGameData(gameDataBaseUrl, "transPoints/scene3", z.array(transPointRewardSchema));
