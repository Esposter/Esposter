import { z } from "zod";

// One furnishing placed in a realm: its item id, the area of the realm's scene it stands in, and where it stands
// In the scene's metres, and the turn it faces in radians
export interface HomePlacement {
  areaId: number;
  furnishingItemId: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  sceneId: number;
}

export const homePlacementSchema = z.object({
  areaId: z.int().positive(),
  furnishingItemId: z.int().positive(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotation: z.number(),
  sceneId: z.int().positive(),
}) satisfies z.ZodType<HomePlacement>;
