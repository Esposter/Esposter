import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// The Frostbearing Tree's place in a region, as the fit writes it into the region's slice: an id the map's point gives it,
// And the ground point it stands at
export interface FrostbearingTreePlace {
  id: string;
  position: GroundPoint;
}

export const frostbearingTreePlaceSchema = z.object({
  id: z.string().min(1),
  position: groundPointSchema,
}) satisfies z.ZodType<FrostbearingTreePlace>;
