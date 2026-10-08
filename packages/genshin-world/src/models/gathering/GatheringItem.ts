import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { materialDataSchema } from "#src/models/inventory/MaterialData";
import { z } from "zod";

// A plant or specialty a gathering point gives: its row of the materials table, and when its points come back
export interface GatheringItem extends MaterialData {
  respawn: GatheringRespawn;
}

export const gatheringItemSchema = materialDataSchema.extend({
  respawn: z.enum(GatheringRespawn),
}) satisfies z.ZodType<GatheringItem>;
