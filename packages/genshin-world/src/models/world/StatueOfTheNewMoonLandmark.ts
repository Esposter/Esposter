import type { BaseLandmark } from "#src/models/world/BaseLandmark";
import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";

import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { landmarkArrivalSchema } from "#src/models/world/LandmarkArrival";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A Statue of the New Moon, which stands where other regions have a Statue of The Seven and, once discovered, is a waypoint
// Exploring jumps to. A jump lands at its arrival, so it always has one
export interface StatueOfTheNewMoonLandmark extends BaseLandmark {
  arrival: LandmarkArrival;
  kind: typeof LandmarkKind.StatueOfTheNewMoon;
}

export const statueOfTheNewMoonLandmarkSchema = baseLandmarkSchema.safeExtend({
  arrival: landmarkArrivalSchema,
  kind: z.literal(LandmarkKind.StatueOfTheNewMoon),
}) satisfies z.ZodType<StatueOfTheNewMoonLandmark>;
