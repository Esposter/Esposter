import type { Fish } from "#src/models/fishing/Fish";

import { fishSchema } from "#src/models/fishing/Fish";
import { z } from "zod";

// The fish, the slice `pnpm -C scripts genshin:assets fishing` writes, imported on demand and checked against its shape
// As it arrives
export const readFish = async (): Promise<Fish[]> => {
  const { default: fish } = await import("#src/generated/fishing/fish.json");
  return z.array(fishSchema).parse(fish);
};
