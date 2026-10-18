import { z } from "zod";

// One area of a realm's scene, by its id within the scene, and the load it holds at most
// The load an area holds is the sum of the loads of the furnishings placed in it
export interface HomeArea {
  areaId: number;
  loadLimit: number;
  sceneId: number;
}

export const homeAreaSchema = z.object({
  areaId: z.int().positive(),
  loadLimit: z.int().positive(),
  sceneId: z.int().positive(),
}) satisfies z.ZodType<HomeArea>;
