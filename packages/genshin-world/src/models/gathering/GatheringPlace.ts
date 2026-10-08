import type { GroundPoint } from "genshin-engine";

import { z } from "zod";

// A gathering point in the world as the fit writes it into its region's generated slice: an id the official map's point
// Gives it, its kind, which is the id of the item it gives, and the ground point it stands at
export interface GatheringPlace {
  id: string;
  kind: number;
  position: GroundPoint;
}

export const gatheringPlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.int().positive(),
  position: z.object({ x: z.number(), z: z.number() }),
}) satisfies z.ZodType<GatheringPlace>;
