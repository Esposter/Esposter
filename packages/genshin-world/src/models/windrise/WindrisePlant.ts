import type { GroundPoint } from "genshin-engine";

import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A plant the game places by its prefab's name: each place's ground point, its turn about the vertical and its scale,
// Whose components a place may leave out
export interface WindrisePlant {
  name: string;
  places: WindrisePlantPlace[];
}
// One place a plant stands at
interface WindrisePlantPlace {
  position: GroundPoint;
  rotation: number;
  scale: number[];
}

const windrisePlantPlaceSchema = z.object({
  position: groundPointSchema,
  rotation: z.number(),
  scale: z.array(z.number()),
}) satisfies z.ZodType<WindrisePlantPlace>;

export const windrisePlantSchema = z.object({
  name: z.string().min(1),
  places: z.array(windrisePlantPlaceSchema),
}) satisfies z.ZodType<WindrisePlant>;
