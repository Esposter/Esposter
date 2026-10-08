import { InazumaBuildingRoof } from "#src/models/inazuma/InazumaBuildingRoof";
import { z } from "zod";

// A building's proportions in metres: its ground footprint, its raised timber floor, and its storeys, each storey's
// Walls and the roof on them. An upper storey is inset from the one below on every side by the setback
export interface InazumaBuildingOptions {
  depth: number;
  eaveOverhang: number;
  floorHeight: number;
  roof: InazumaBuildingRoof;
  roofHeight: number;
  storeyCount: number;
  storeyHeight: number;
  storeySetback: number;
  width: number;
}

export const inazumaBuildingOptionsSchema = z.object({
  depth: z.number().positive(),
  eaveOverhang: z.number().nonnegative(),
  floorHeight: z.number().nonnegative(),
  roof: z.enum(InazumaBuildingRoof),
  roofHeight: z.number().positive(),
  storeyCount: z.int().positive(),
  storeyHeight: z.number().positive(),
  storeySetback: z.number().nonnegative(),
  width: z.number().positive(),
}) satisfies z.ZodType<InazumaBuildingOptions>;
