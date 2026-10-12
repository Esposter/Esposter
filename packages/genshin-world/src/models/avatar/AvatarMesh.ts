import type { AvatarSubmesh } from "#src/models/avatar/AvatarSubmesh";
import type { AvatarView } from "#src/models/avatar/AvatarView";

// One of the model's meshes: its vertex attributes, its triangles as indices, and the runs of those triangles each
// Material draws. Joints index the rig's bones, and a vertex's four weights sum to one
export interface AvatarMesh {
  colors: AvatarView;
  indices: AvatarView & { isUint32: boolean };
  joints: AvatarView;
  name: string;
  normals: AvatarView;
  positions: AvatarView;
  submeshes: AvatarSubmesh[];
  tangents: AvatarView;
  uvs: AvatarView;
  weights: AvatarView;
}
