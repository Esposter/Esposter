import { z } from "zod";

// A fishing-area prop's place in its region, as the fishing dataset holds it: the mesh the game names it by, and where
// It stands, its turn as a quaternion and its scale, in the same axes the region's scene is laid out in
export interface FishingPropPlace {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
  scale: [number, number, number];
}

export const fishingPropPlaceSchema = z.object({
  name: z.string().min(1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]),
}) satisfies z.ZodType<FishingPropPlace>;
