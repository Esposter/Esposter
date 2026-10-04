import type { BaseLandmark } from "#src/models/world/BaseLandmark";

import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A Statue of The Seven, one per area, which exploring jumps to as the game fast-travels
export interface StatueLandmark extends BaseLandmark {
  kind: LandmarkKind.StatueOfTheSeven;
}

export const statueLandmarkSchema = baseLandmarkSchema.safeExtend({
  kind: z.literal(LandmarkKind.StatueOfTheSeven),
}) satisfies z.ZodType<StatueLandmark>;
