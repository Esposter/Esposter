import type { VoxelGrid } from "@/models/agentConsole/world/VoxelGrid";
import type { Vector3 } from "three";

import { COLLISION_GAP, PLAYER_HALF_WIDTH, PLAYER_HEIGHT } from "@/services/agentConsole/world/constants";
import { getVoxel } from "@/services/agentConsole/world/getVoxel";
// Whether the player's box, standing with its feet at a point, overlaps a solid voxel or reaches off the floor's edge
const checkIsBlocked = (roomGrid: VoxelGrid, x: number, y: number, z: number) => {
  const minX = Math.floor(x - PLAYER_HALF_WIDTH);
  const maxX = Math.ceil(x + PLAYER_HALF_WIDTH) - 1;
  const minZ = Math.floor(z - PLAYER_HALF_WIDTH);
  const maxZ = Math.ceil(z + PLAYER_HALF_WIDTH) - 1;
  if (minX < 0 || minZ < 0 || maxX >= roomGrid.width || maxZ >= roomGrid.depth) return true;
  for (let voxelZ = minZ; voxelZ <= maxZ; voxelZ++)
    for (let voxelY = Math.floor(y); voxelY < Math.ceil(y + PLAYER_HEIGHT); voxelY++)
      for (let voxelX = minX; voxelX <= maxX; voxelX++) if (getVoxel(roomGrid, voxelX, voxelY, voxelZ)) return true;
  return false;
};
// One step of the player's box across the floor, resolved one axis at a time: the step along x is taken and cut short
// At the first solid voxel, then the step along z, so a step into a wall at an angle slides along it. Correct only
// While a step stays well under a voxel, which walking speed at the simulation's step always does
export const moveThroughGrid = (roomGrid: VoxelGrid, position: Vector3, stepX: number, stepZ: number) => {
  const x = position.x + stepX;
  if (!checkIsBlocked(roomGrid, x, position.y, position.z)) position.x = x;
  else if (stepX > 0) position.x = Math.floor(x + PLAYER_HALF_WIDTH) - PLAYER_HALF_WIDTH - COLLISION_GAP;
  else if (stepX < 0) position.x = Math.floor(x - PLAYER_HALF_WIDTH) + 1 + PLAYER_HALF_WIDTH + COLLISION_GAP;

  const z = position.z + stepZ;
  if (!checkIsBlocked(roomGrid, position.x, position.y, z)) position.z = z;
  else if (stepZ > 0) position.z = Math.floor(z + PLAYER_HALF_WIDTH) - PLAYER_HALF_WIDTH - COLLISION_GAP;
  else if (stepZ < 0) position.z = Math.floor(z - PLAYER_HALF_WIDTH) + 1 + PLAYER_HALF_WIDTH + COLLISION_GAP;
};
