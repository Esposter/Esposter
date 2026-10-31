import type { GroundPoint } from "genshin-engine";

import { ChestKind } from "#src/models/chest/ChestKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A chest's place in the world, as the fit writes it into its region's generated slice: an id the map's point gives it,
// Its kind, and the ground point it stands at. Its height is the ground's own at that point, read when it is placed
export interface ChestPlace {
  id: string;
  kind: ChestKind;
  position: GroundPoint;
}

export const chestPlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(ChestKind),
  position: groundPointSchema,
}) satisfies z.ZodType<ChestPlace>;
