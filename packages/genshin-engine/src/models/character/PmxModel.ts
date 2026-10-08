import type { PmxBone } from "#src/models/character/PmxBone";
import type { PmxJoint } from "#src/models/character/PmxJoint";
import type { PmxMaterial } from "#src/models/character/PmxMaterial";
import type { PmxMorph } from "#src/models/character/PmxMorph";
import type { PmxRigidBody } from "#src/models/character/PmxRigidBody";
import type { PmxVertices } from "#src/models/character/PmxVertices";

// An MMD model as a PMX file holds it, turned into three's right-handed space: its vertices, its triangles three
// Indices each and wound as three's front faces are, the paths of its textures relative to the file, its materials in
// The order MMD draws them, its bones, its morphs, and the rigid bodies and joints its physics reads
export interface PmxModel {
  bones: PmxBone[];
  indices: Uint32Array;
  joints: PmxJoint[];
  materials: PmxMaterial[];
  morphs: PmxMorph[];
  name: string;
  rigidBodies: PmxRigidBody[];
  textures: string[];
  vertices: PmxVertices;
}
