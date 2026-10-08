import type { PlateauFeature } from "genshin-engine";

import { plateauFeatureSchema } from "#src/models/world/plateauFeatureSchema";
import { z } from "zod";

// A region's ground where no fit has drawn it yet: the plateaus its places stand on, added to the world's one ground
export interface RegionGround {
  features: PlateauFeature[];
}

export const regionGroundSchema = z.object({
  features: z.array(plateauFeatureSchema),
}) satisfies z.ZodType<RegionGround>;
