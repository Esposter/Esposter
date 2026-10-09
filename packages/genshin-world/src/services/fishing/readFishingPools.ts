import type { FishingPool } from "#src/models/fishing/FishingPool";

import { fishingPoolSchema } from "#src/models/fishing/FishingPool";
import { z } from "zod";

// The fishing pools of each region, the slice `pnpm -C scripts genshin:assets fishing` writes, imported on demand and
// Checked against its shape as it arrives
export const readFishingPools = async (): Promise<Record<string, FishingPool[]>> => {
  const { default: fishingPools } = await import("#src/generated/fishing/pools.json");
  return z.record(z.string(), z.array(fishingPoolSchema)).parse(fishingPools);
};
