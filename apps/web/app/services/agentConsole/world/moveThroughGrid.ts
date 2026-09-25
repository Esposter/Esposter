import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
import type { WorldBox } from "@/models/agentConsole/world/WorldBox";
import type { Vector3, Vector3Tuple } from "three";

import { Axis } from "@/models/agentConsole/world/Axis";
import { COLLISION_GAP, PLAYER_HALF_WIDTH } from "@/services/agentConsole/world/constants";
import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";

// Minecraft's order: up or down first, then x, then z
const AXIS_ORDER: readonly Axis[] = [Axis.Y, Axis.X, Axis.Z];
// The player's box as it stands, reused so a step allocates nothing
const playerMin: Vector3Tuple = [0, 0, 0];
const playerMax: Vector3Tuple = [0, 0, 0];

const setPlayerBox = ({ x, y, z }: Vector3, height: number) => {
  playerMin[Axis.X] = x - PLAYER_HALF_WIDTH;
  playerMin[Axis.Y] = y;
  playerMin[Axis.Z] = z - PLAYER_HALF_WIDTH;
  playerMax[Axis.X] = x + PLAYER_HALF_WIDTH;
  playerMax[Axis.Y] = y + height;
  playerMax[Axis.Z] = z + PLAYER_HALF_WIDTH;
};
// How far the player's box may go along an axis before it meets one box, as Minecraft clips a move against each
// Collision box: only a box it overlaps on the other two axes stops it, and one it is already inside never does
const clipAgainstBox = (
  axis: Axis,
  distance: number,
  minX: number,
  minY: number,
  minZ: number,
  maxX: number,
  maxY: number,
  maxZ: number,
) => {
  const boxMin = axis === Axis.X ? minX : axis === Axis.Y ? minY : minZ;
  const boxMax = axis === Axis.X ? maxX : axis === Axis.Y ? maxY : maxZ;
  if (axis !== Axis.X && (playerMax[Axis.X] <= minX || playerMin[Axis.X] >= maxX)) return distance;
  if (axis !== Axis.Y && (playerMax[Axis.Y] <= minY || playerMin[Axis.Y] >= maxY)) return distance;
  if (axis !== Axis.Z && (playerMax[Axis.Z] <= minZ || playerMin[Axis.Z] >= maxZ)) return distance;
  if (distance > 0 && playerMax[axis] <= boxMin)
    return Math.min(distance, Math.max(boxMin - playerMax[axis] - COLLISION_GAP, 0));
  if (distance < 0 && playerMin[axis] >= boxMax)
    return Math.max(distance, Math.min(boxMax - playerMin[axis] + COLLISION_GAP, 0));
  return distance;
};
// How far the player's box may go along an axis: a solid voxel is a box a voxel wide, and a thing drawn apart from the
// Voxels, such as the door, brings its own, so everything the player meets collides the same way
const clipAlongAxis = (voxelWorld: VoxelWorld, worldBoxes: readonly WorldBox[], axis: Axis, distance: number) => {
  // The voxels the box sweeps through: its own, stretched along the axis by the distance
  const backward = Math.min(distance, 0);
  const forward = Math.max(distance, 0);
  const minX = Math.floor(playerMin[Axis.X] + (axis === Axis.X ? backward : 0));
  const maxX = Math.ceil(playerMax[Axis.X] + (axis === Axis.X ? forward : 0));
  const minY = Math.floor(playerMin[Axis.Y] + (axis === Axis.Y ? backward : 0));
  const maxY = Math.ceil(playerMax[Axis.Y] + (axis === Axis.Y ? forward : 0));
  const minZ = Math.floor(playerMin[Axis.Z] + (axis === Axis.Z ? backward : 0));
  const maxZ = Math.ceil(playerMax[Axis.Z] + (axis === Axis.Z ? forward : 0));
  let clippedDistance = distance;
  for (let voxelZ = minZ; voxelZ < maxZ; voxelZ++)
    for (let voxelY = minY; voxelY < maxY; voxelY++)
      for (let voxelX = minX; voxelX < maxX; voxelX++)
        if (getWorldVoxel(voxelWorld, voxelX, voxelY, voxelZ))
          clippedDistance = clipAgainstBox(
            axis,
            clippedDistance,
            voxelX,
            voxelY,
            voxelZ,
            voxelX + 1,
            voxelY + 1,
            voxelZ + 1,
          );
  for (const { max, min } of worldBoxes)
    clippedDistance = clipAgainstBox(axis, clippedDistance, min[0], min[1], min[2], max[0], max[1], max[2]);
  return clippedDistance;
};
// One step of the player's box, clipped one axis at a time against every box it would meet, so a step into a wall at an
// Angle slides along it and a fall stops on the ground. A clipped axis's step is zeroed, so the caller stops its
// Velocity along that axis. Held at an edge, as a sneaking player on the ground is, a sideways step that would leave
// Nothing under the feet is not taken
export const moveThroughGrid = (
  voxelWorld: VoxelWorld,
  worldBoxes: readonly WorldBox[],
  position: Vector3,
  step: Vector3,
  height: number,
  isHeldAtEdge: boolean,
) => {
  for (const axis of AXIS_ORDER) {
    const distance = step.getComponent(axis);
    if (distance === 0) continue;
    setPlayerBox(position, height);
    const clippedDistance = clipAlongAxis(voxelWorld, worldBoxes, axis, distance);
    const start = position.getComponent(axis);
    position.setComponent(axis, start + clippedDistance);
    if (axis !== Axis.Y && isHeldAtEdge) {
      setPlayerBox(position, height);
      const probe = -2 * COLLISION_GAP;
      if (clipAlongAxis(voxelWorld, worldBoxes, Axis.Y, probe) === probe) {
        position.setComponent(axis, start);
        step.setComponent(axis, 0);
        continue;
      }
    }
    if (clippedDistance !== distance) step.setComponent(axis, 0);
  }
};
