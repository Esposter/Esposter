import type { FishRod } from "#src/models/fishing/FishRod";

import { fishRodSchema } from "#src/models/fishing/FishRod";
import { z } from "zod";

// The rods, the slice `pnpm -C scripts genshin:assets fishing` writes, imported on demand and checked against its shape
// As it arrives
export const readFishRods = async (): Promise<FishRod[]> => {
  const { default: fishRods } = await import("#src/generated/fishing/rods.json");
  return z.array(fishRodSchema).parse(fishRods);
};
