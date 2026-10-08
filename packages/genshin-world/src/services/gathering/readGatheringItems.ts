import type { GatheringItem } from "#src/models/gathering/GatheringItem";

import { gatheringItemSchema } from "#src/models/gathering/GatheringItem";
import { z } from "zod";

// The plants and specialties the gathering points give, imported on demand from their generated table and checked
// Against its schema as it arrives
export const readGatheringItems = async (): Promise<GatheringItem[]> => {
  const { default: items } = await import("#src/generated/gathering/items.json");
  return z.array(gatheringItemSchema).parse(items);
};
