import { createVoxelGeometry } from "@/services/agentConsole/world/createVoxelGeometry";
// One white voxel, shaded by the way each face faces, for a mesh whose material tints it: a scale and a colour then
// Change what it shows without rebuilding it
export const createTintableVoxelGeometry = () =>
  createVoxelGeometry({ depth: 1, height: 1, voxels: Uint8Array.of(1), width: 1 }, [[1, 1, 1]]);
