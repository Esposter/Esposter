import type { AvatarSubmesh } from "#src/models/avatar/AvatarSubmesh";
import type { AvatarView } from "#src/models/avatar/AvatarView";

import { avatarSubmeshSchema } from "#src/models/avatar/AvatarSubmesh";
import { avatarViewSchema } from "#src/models/avatar/AvatarView";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One of the model's meshes: its vertex attributes, its triangles as indices, and the runs of those triangles each
// Material draws. Joints index the rig's bones, and a vertex's four weights sum to one
export interface AvatarMesh {
  colors: AvatarView;
  indices: AvatarView & { isUint32: boolean };
  joints: AvatarView;
  name: string;
  normals: AvatarView;
  positions: AvatarView;
  // The rig node of the renderer's root bone, the transform the face's light is read against
  rootBone: number;
  submeshes: AvatarSubmesh[];
  tangents: AvatarView;
  uvs: AvatarView;
  weights: AvatarView;
}

export const avatarMeshSchema = z.object({
  colors: avatarViewSchema,
  indices: avatarViewSchema.safeExtend({ isUint32: z.boolean() }),
  joints: avatarViewSchema,
  name: z.string().min(1),
  normals: avatarViewSchema,
  positions: avatarViewSchema,
  rootBone: z.int().nonnegative(),
  // Runs of one mesh's indices partition its triangles, so no two start at the same index
  submeshes: createUniqueArraySchema(avatarSubmeshSchema, "start"),
  tangents: avatarViewSchema,
  uvs: avatarViewSchema,
  weights: avatarViewSchema,
}) satisfies z.ZodType<AvatarMesh>;
