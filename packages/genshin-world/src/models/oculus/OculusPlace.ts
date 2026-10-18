import type { GroundPoint } from "genshin-engine";

import { OculusKind } from "#src/models/oculus/OculusKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// An Oculus's place in the world, as the fit writes it into its region's generated slice: an id the map's point gives it,
// Its kind, and the ground point it stands at. Its height is the ground's own at that point, read when it is placed
export interface OculusPlace {
  id: string;
  kind: OculusKind;
  position: GroundPoint;
}

export const oculusPlaceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(OculusKind),
  position: groundPointSchema,
}) satisfies z.ZodType<OculusPlace>;
