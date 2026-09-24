import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";

import { CHUNK_BORDER, CHUNK_SIZE, WORLD_HEIGHT } from "@/services/agentConsole/world/constants";
import { getChunkKey } from "@/services/agentConsole/world/getChunkKey";
import { getVoxel } from "@/services/agentConsole/world/getVoxel";
// Any solid voxel, standing in for the ground of a chunk not generated yet
const UNGENERATED_GROUND_VOXEL = 1;
// A voxel of the world, looked up through the chunk that holds it, and empty above and below the world. A chunk not
// Generated yet reads as level ground at the room's floor, the ground the room stands on, so nothing falls through it
// While it is on its way and the camera's arm is not pulled in by ground that is not there
export const getWorldVoxel = (voxelWorld: VoxelWorld, x: number, y: number, z: number) => {
  if (y < 0 || y >= WORLD_HEIGHT) return 0;
  const chunkX = Math.floor(x / CHUNK_SIZE);
  const chunkZ = Math.floor(z / CHUNK_SIZE);
  const chunkGrid = voxelWorld.get(getChunkKey(chunkX, chunkZ));
  if (chunkGrid)
    return getVoxel(chunkGrid, x - chunkX * CHUNK_SIZE + CHUNK_BORDER, y, z - chunkZ * CHUNK_SIZE + CHUNK_BORDER);
  else return y === 0 ? UNGENERATED_GROUND_VOXEL : 0;
};
