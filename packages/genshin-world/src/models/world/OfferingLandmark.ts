import type { GroundPoint } from "genshin-engine";

import { OfferingKind } from "#src/models/offering/OfferingKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// An offering the game places in a region, stood at its point on the ground and offered to from there. Its kind names the
// Levels it is offered to, published under `offerings/<kind>`, and the text its prompt is named by
export interface OfferingLandmark {
  id: string;
  kind: typeof LandmarkKind.Offering;
  offeringKind: OfferingKind;
  position: GroundPoint;
}

export const offeringLandmarkSchema = z.object({
  id: z.string().min(1),
  kind: z.literal(LandmarkKind.Offering),
  offeringKind: z.enum(OfferingKind),
  position: groundPointSchema,
}) satisfies z.ZodType<OfferingLandmark>;
