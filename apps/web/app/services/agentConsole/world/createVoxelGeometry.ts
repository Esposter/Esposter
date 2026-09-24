import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { Vector3Tuple } from "three";

import { createVoxelMeshGeometry } from "@/services/agentConsole/world/createVoxelMeshGeometry";
import { greedyMesh } from "@/services/agentConsole/world/greedyMesh";
import { PaletteRgbs } from "@/services/agentConsole/world/PaletteRgbs";

export const createVoxelGeometry = (voxelGrid: VoxelGrid, rgbs: readonly Vector3Tuple[] = PaletteRgbs) => {
  const voxelMesh = greedyMesh(voxelGrid, rgbs);
  return createVoxelMeshGeometry(voxelMesh);
};
