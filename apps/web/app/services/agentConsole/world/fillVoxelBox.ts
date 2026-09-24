import type { VoxelBox } from "@/models/agentConsole/world/VoxelBox";
import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";

import { PaletteColors } from "@/models/agentConsole/PaletteColor";

export const fillVoxelBox = ({ height, voxels, width }: VoxelGrid, { color, max, min }: VoxelBox) => {
  const voxel = PaletteColors.indexOf(color) + 1;
  for (let z = min[2]; z <= max[2]; z++)
    for (let y = min[1]; y <= max[1]; y++)
      for (let x = min[0]; x <= max[0]; x++) voxels[x + width * (y + height * z)] = voxel;
};
