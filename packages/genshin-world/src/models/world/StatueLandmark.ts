import type { LandmarkBase } from "#src/models/world/LandmarkBase";

import { landmarkBaseSchema } from "#src/models/world/LandmarkBase";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A Statue of The Seven, one per area, which exploring jumps to as the game fast-travels
export interface StatueLandmark extends LandmarkBase {
  kind: LandmarkKind.StatueOfTheSeven;
}

export const statueLandmarkSchema = landmarkBaseSchema.safeExtend({
  kind: z.literal(LandmarkKind.StatueOfTheSeven),
}) satisfies z.ZodType<StatueLandmark>;
