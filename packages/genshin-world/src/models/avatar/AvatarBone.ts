import type { Vector3Tuple, Vector4Tuple } from "three";

import { z } from "zod";

// One bone of a rig: its path in the rig, the index of its parent (-1 for the root), and its rest pose, local to its parent
export interface AvatarBone {
  name: string;
  parent: number;
  position: Vector3Tuple;
  rotation: Vector4Tuple;
  scale: Vector3Tuple;
}

export const avatarBoneSchema = z.object({
  // Empty for the rig's root, which has no path to name it by
  name: z.string(),
  parent: z.int().min(-1),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]),
}) satisfies z.ZodType<AvatarBone>;
