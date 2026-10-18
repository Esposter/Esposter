import type { MonumentPlace } from "#src/models/puzzle/MonumentPlace";
import type { GroundPoint } from "genshin-engine";

import { monumentPlaceSchema } from "#src/models/puzzle/MonumentPlace";
import { PuzzleKind } from "#src/models/puzzle/PuzzleKind";
import type { SeeliePlace } from "#src/models/puzzle/SeeliePlace";
import { seeliePlaceSchema } from "#src/models/puzzle/SeeliePlace";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A puzzle's mechanism as the fit writes it into its region's generated slice: an id the map's point gives it, its kind,
// And the ground point it stands at. Its height is the ground's own at that point, read when it is placed. An Elemental
// Monument also carries its element and timing, and a Seelie whether its region's court is on the map, which no other kind has
export interface PuzzlePlace {
  id: string;
  kind: PuzzleKind;
  monument?: MonumentPlace;
  position: GroundPoint;
  seelie?: SeeliePlace;
}

export const puzzlePlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(PuzzleKind),
  monument: monumentPlaceSchema.optional(),
  position: groundPointSchema,
  seelie: seeliePlaceSchema.optional(),
}) satisfies z.ZodType<PuzzlePlace>;
