import { z } from "zod";

// One NPC the open world's scene places, as the dump's birth record gives it: its birth id, the NPC's config id, the
// Group it is born in, its place in the game's axes and its turn about the vertical in degrees, which a record without
// One leaves unset, and the suites of its group it is placed in, empty where the record names none
export interface SceneNpcBorn {
  configId: number;
  groupId: number;
  id: number;
  position: { x: number; y: number; z: number };
  rotationY?: number;
  suiteIds: number[];
}

export const sceneNpcBornSchema = z.object({
  configId: z.int().nonnegative(),
  groupId: z.int().nonnegative(),
  id: z.int().positive(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  rotationY: z.number().optional(),
  suiteIds: z.array(z.int().positive()),
}) satisfies z.ZodType<SceneNpcBorn>;
