import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
// A voxel's colour index plus one, or 0 where it is empty or outside the grid
export const getVoxel = ({ depth, height, voxels, width }: VoxelGrid, x: number, y: number, z: number) =>
  x < 0 || y < 0 || z < 0 || x >= width || y >= height || z >= depth ? 0 : (voxels[x + width * (y + height * z)] ?? 0);
