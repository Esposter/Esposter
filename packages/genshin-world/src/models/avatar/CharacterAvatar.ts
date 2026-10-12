import type { ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, Group, SkinnedMesh } from "three";

// A game model drawn from the developer's exports: its group, placed as a pack's model is, and each of its skinned
// Meshes, which share one skeleton the poser moves
export interface CharacterAvatar {
  model: Group;
  skinnedMeshes: SkinnedMesh<BufferGeometry, ToonNodeMaterial[]>[];
}
