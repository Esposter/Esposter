import { z } from "zod";

// One transport point the open world's unlock table lists, by its id and the scene it is in, which the statues and the
// Waypoints name in the open world's scene
export interface TransPointUnlock {
  pointId: number;
  sceneId: number;
}

export const transPointUnlockSchema = z.object({
  pointId: z.int().nonnegative(),
  sceneId: z.int().nonnegative(),
}) satisfies z.ZodType<TransPointUnlock>;
