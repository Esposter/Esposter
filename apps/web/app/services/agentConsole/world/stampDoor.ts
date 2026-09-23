import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";

import { PaletteColors } from "@/models/agentConsole/PaletteColor";
import { CHUNK_BORDER, CHUNK_SIZE, DOOR_CLOSED_BOX } from "@/services/agentConsole/world/constants";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
// The door's voxels in its opening, written into the chunk that holds each one: solid while it is closed and empty
// While it is open, so the player collides with the door as it stands the moment it is used. The door is drawn apart
// From the chunks, so no mesh is built again; a chunk not generated yet is written when it arrives
export const stampDoor = (voxelWorld: VoxelWorld, isDoorOpen: boolean) => {
  const { color, max, min } = DOOR_CLOSED_BOX;
  const voxel = isDoorOpen ? 0 : PaletteColors.indexOf(color) + 1;
  for (let z = min[2]; z <= max[2]; z++)
    for (let y = min[1]; y <= max[1]; y++)
      for (let x = min[0]; x <= max[0]; x++) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        const chunkGrid = voxelWorld.get(getChunkKey(chunkX, chunkZ));
        if (!chunkGrid) continue;
        const gridX = x - chunkX * CHUNK_SIZE + CHUNK_BORDER;
        const gridZ = z - chunkZ * CHUNK_SIZE + CHUNK_BORDER;
        chunkGrid.voxels[gridX + chunkGrid.width * (y + chunkGrid.height * gridZ)] = voxel;
      }
};
