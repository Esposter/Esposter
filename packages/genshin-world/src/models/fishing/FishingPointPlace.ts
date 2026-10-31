import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A fishing point's place in the world, as the fit writes it into its region's slice: an id the map's point gives it and
// The ground point it stands at
export interface FishingPointPlace {
  id: string;
  position: GroundPoint;
}

export const fishingPointPlaceSchema = z.object({
  id: z.string(),
  position: groundPointSchema,
}) satisfies z.ZodType<FishingPointPlace>;
