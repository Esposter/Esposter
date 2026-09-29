import type { LandmarkBase } from "@/models/genshin/world/LandmarkBase";

import { LandmarkKind } from "@/models/genshin/world/LandmarkKind";
import { landmarkBaseSchema } from "@/models/genshin/world/LandmarkBase";
import { z } from "zod";

// A Statue of The Seven, one per area, which exploring jumps to as the game fast-travels
export interface StatueLandmark extends LandmarkBase {
  kind: LandmarkKind.StatueOfTheSeven;
}

export const statueLandmarkSchema = landmarkBaseSchema.safeExtend({
  kind: z.literal(LandmarkKind.StatueOfTheSeven),
}) satisfies z.ZodType<StatueLandmark>;
