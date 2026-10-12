import type { AvatarBone } from "#src/models/avatar/AvatarBone";
import type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
import type { AvatarMesh } from "#src/models/avatar/AvatarMesh";

// The game's own character model as the developer's exports hold it, in `avatar.json`: its rig's bones in their rest pose,
// Parents before children, the Unity humanoid names of the bones that matter to a pose, its meshes and its materials. The
// Meshes' arrays sit in `avatar.bin` at the offsets the manifest gives, in three's axes
export interface AvatarManifest {
  bones: AvatarBone[];
  // The Unity humanoid name of each bone the rig holds one for, to the index of that bone
  humanoid: Record<string, number>;
  materials: Record<string, AvatarMaterial>;
  meshes: AvatarMesh[];
}
