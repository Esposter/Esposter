import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A material source in the world as the fit writes it into its region's generated slice: an id the official map's point
// Gives it, its kind, which is the id of the item it gives when picked, and the ground point it stands at
export interface MaterialSourcePlace {
  id: string;
  kind: number;
  position: GroundPoint;
}

export const materialSourcePlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.int().positive(),
  position: groundPointSchema,
}) satisfies z.ZodType<MaterialSourcePlace>;
