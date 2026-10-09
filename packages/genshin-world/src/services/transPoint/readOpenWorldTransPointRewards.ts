import type { TransPointReward } from "#src/models/transPoint/TransPointReward";

import { transPointRewardSchema } from "#src/models/transPoint/TransPointReward";
import { z } from "zod";

// The open world's transport point rewards, the slice `pnpm -C scripts genshin:assets trans-points` writes, imported on
// Demand as a chunk of its own and checked against its shape as it arrives
export const readOpenWorldTransPointRewards = async (): Promise<TransPointReward[]> => {
  const { default: openWorldTransPointRewards } = await import("#src/generated/transPoints/scene3.json");
  return z.array(transPointRewardSchema).parse(openWorldTransPointRewards);
};
