import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A material source's kind as the build writes it: the id of the item it gives when picked, and whether a critter
// Stands At its point, which it does unless the dump types that item a chest
export interface MaterialSourceKind {
  hasStandIn: boolean;
  itemId: number;
}

// A material source in the world as the fit writes it into its region's generated slice: an id the official map's point
// Gives it, its kind, and the ground point it stands at
export interface MaterialSourcePlace {
  id: string;
  kind: MaterialSourceKind;
  position: GroundPoint;
}

export const materialSourceKindSchema = z.object({
  hasStandIn: z.boolean(),
  itemId: z.int().positive(),
}) satisfies z.ZodType<MaterialSourceKind>;

export const materialSourcePlaceSchema = z.object({
  id: z.string().min(1),
  kind: materialSourceKindSchema,
  position: groundPointSchema,
}) satisfies z.ZodType<MaterialSourcePlace>;
