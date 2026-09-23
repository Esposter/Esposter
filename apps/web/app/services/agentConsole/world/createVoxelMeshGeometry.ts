import type { VoxelMesh } from "@/models/agentConsole/world/VoxelMesh";

import { BufferAttribute, BufferGeometry } from "three";

export const createVoxelMeshGeometry = ({ colors, indices, positions }: VoxelMesh) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
};
