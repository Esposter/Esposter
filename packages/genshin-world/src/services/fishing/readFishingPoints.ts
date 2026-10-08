import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";

import { fishingPointPlaceSchema } from "#src/models/fishing/FishingPointPlace";
import { z } from "zod";

// The fishing points of each region, the slice `pnpm -C scripts genshin:assets fishing` writes, imported on demand and
// Checked against its shape as it arrives
export const readFishingPoints = async (): Promise<Record<string, FishingPointPlace[]>> => {
  const { default: fishingPoints } = await import("#src/generated/fishing/points.json");
  return z.record(z.string(), z.array(fishingPointPlaceSchema)).parse(fishingPoints);
};
