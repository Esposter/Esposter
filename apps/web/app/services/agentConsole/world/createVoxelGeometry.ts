import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { Vector3Tuple } from "three";

import { greedyMesh } from "@/services/agentConsole/world/greedyMesh";
import { PaletteRgbs } from "@/services/agentConsole/world/PaletteRgbs";
import { BufferAttribute, BufferGeometry } from "three";

export const createVoxelGeometry = (voxelGrid: VoxelGrid, rgbs: readonly Vector3Tuple[] = PaletteRgbs) => {
  const { colors, indices, positions } = greedyMesh(voxelGrid, rgbs);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
};
