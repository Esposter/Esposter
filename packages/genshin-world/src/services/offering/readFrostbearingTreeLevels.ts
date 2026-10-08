import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { offeringLevelSchema } from "#src/models/offering/OfferingLevel";
import { z } from "zod";

// The Frostbearing Tree's levels, the slice `pnpm -C scripts genshin:assets offerings` writes, imported on demand as a
// Chunk of its own and checked against its shape as it arrives
export const readFrostbearingTreeLevels = async (): Promise<OfferingLevel[]> => {
  const { default: frostbearingTreeLevels } = await import("#src/generated/offerings/frostbearingTree.json");
  return z.array(offeringLevelSchema).parse(frostbearingTreeLevels);
};
