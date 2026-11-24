import type { GroundPoint } from "genshin-engine";

import { OfferingKind } from "#src/models/offering/OfferingKind";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// An offering's place in a region as `pnpm -C scripts genshin:assets offerings` publishes it: the map point's id it
// Stands at, the offering's kind, and the ground point the fit carries the map's point to
export interface OfferingPlaceRecord {
  id: string;
  kind: OfferingKind;
  position: GroundPoint;
}

export const offeringPlaceRecordSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(OfferingKind),
  position: groundPointSchema,
}) satisfies z.ZodType<OfferingPlaceRecord>;
