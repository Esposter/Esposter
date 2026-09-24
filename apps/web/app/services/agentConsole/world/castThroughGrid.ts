import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
import type { Vector3 } from "three";

import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";
// How far a ray goes from a point along a unit direction before it enters a solid voxel, up to a limit. It walks the
// Grid one voxel boundary at a time, always crossing the nearest one next, so no voxel it passes is skipped
export const castThroughGrid = (voxelWorld: VoxelWorld, origin: Vector3, direction: Vector3, maxDistance: number) => {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);
  const stepX = Math.sign(direction.x);
  const stepY = Math.sign(direction.y);
  const stepZ = Math.sign(direction.z);
  // The distance along the ray between two boundaries of one axis, and to the first boundary it crosses: never, along
  // An axis the ray does not move on
  const deltaX = Math.abs(1 / direction.x);
  const deltaY = Math.abs(1 / direction.y);
  const deltaZ = Math.abs(1 / direction.z);
  let nextX = stepX === 0 ? Infinity : (stepX > 0 ? x + 1 - origin.x : origin.x - x) * deltaX;
  let nextY = stepY === 0 ? Infinity : (stepY > 0 ? y + 1 - origin.y : origin.y - y) * deltaY;
  let nextZ = stepZ === 0 ? Infinity : (stepZ > 0 ? z + 1 - origin.z : origin.z - z) * deltaZ;
  let distance = 0;

  while (distance < maxDistance)
    if (getWorldVoxel(voxelWorld, x, y, z)) return distance;
    else if (nextX <= nextY && nextX <= nextZ) {
      x += stepX;
      distance = nextX;
      nextX += deltaX;
    } else if (nextY <= nextZ) {
      y += stepY;
      distance = nextY;
      nextY += deltaY;
    } else {
      z += stepZ;
      distance = nextZ;
      nextZ += deltaZ;
    }

  return maxDistance;
};
