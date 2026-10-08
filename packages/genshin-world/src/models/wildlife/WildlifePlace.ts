import type { GroundPoint } from "genshin-engine";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// An animal's place in the world, as the fit writes it into its region's generated slice: an id the map's point gives
// It, its kind, and the ground point it stands at, where it is spawned and walks back to
export interface WildlifePlace {
  id: string;
  kind: WildlifeKind;
  position: GroundPoint;
}

export const wildlifePlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(WildlifeKind),
  position: groundPointSchema,
}) satisfies z.ZodType<WildlifePlace>;
