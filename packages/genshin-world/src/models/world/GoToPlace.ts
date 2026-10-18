import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A place a quest's go-to step is reached at, named by the id of the trigger its objective names: where it stands in the
// Game's axes, and how close, in metres, the Traveler must come for the step to be reached
export interface GoToPlace {
  id: string;
  position: GroundPoint;
  radius: number;
}

export const goToPlaceSchema = z.object({
  id: z.string().min(1),
  position: groundPointSchema,
  radius: z.number().positive(),
}) satisfies z.ZodType<GoToPlace>;
