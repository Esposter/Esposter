import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColors } from "@/models/agentConsole/PaletteColor";
// The part of a box inside the grid, so a structure stamped across a chunk's border fills only this chunk's share
export const fillVoxelBox = ({ depth, height, voxels, width }: VoxelGrid, { color, max, min }: VoxelBox) => {
  const voxel = PaletteColors.indexOf(color) + 1;
  for (let z = Math.max(min[2], 0); z <= Math.min(max[2], depth - 1); z++)
    for (let y = Math.max(min[1], 0); y <= Math.min(max[1], height - 1); y++)
      for (let x = Math.max(min[0], 0); x <= Math.min(max[0], width - 1); x++)
        voxels[x + width * (y + height * z)] = voxel;
};
