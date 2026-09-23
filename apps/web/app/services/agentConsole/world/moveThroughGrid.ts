import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
import type { WorldBox } from "@/models/agentConsole/world/WorldBox";
import type { Vector3, Vector3Tuple } from "three";

import { COLLISION_GAP, PLAYER_HALF_WIDTH } from "@/services/agentConsole/world/constants";
import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";

const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
type Axis = typeof X_AXIS | typeof Y_AXIS | typeof Z_AXIS;
// Minecraft's order: up or down first, then x, then z
const AXIS_ORDER: readonly Axis[] = [Y_AXIS, X_AXIS, Z_AXIS];
// The player's box as it stands, reused so a step allocates nothing
const playerMin: Vector3Tuple = [0, 0, 0];
const playerMax: Vector3Tuple = [0, 0, 0];

const setPlayerBox = ({ x, y, z }: Vector3, height: number) => {
  playerMin[X_AXIS] = x - PLAYER_HALF_WIDTH;
  playerMin[Y_AXIS] = y;
  playerMin[Z_AXIS] = z - PLAYER_HALF_WIDTH;
  playerMax[X_AXIS] = x + PLAYER_HALF_WIDTH;
  playerMax[Y_AXIS] = y + height;
  playerMax[Z_AXIS] = z + PLAYER_HALF_WIDTH;
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
  const boxMin = axis === X_AXIS ? minX : axis === Y_AXIS ? minY : minZ;
  const boxMax = axis === X_AXIS ? maxX : axis === Y_AXIS ? maxY : maxZ;
  if (axis !== X_AXIS && (playerMax[X_AXIS] <= minX || playerMin[X_AXIS] >= maxX)) return distance;
  if (axis !== Y_AXIS && (playerMax[Y_AXIS] <= minY || playerMin[Y_AXIS] >= maxY)) return distance;
  if (axis !== Z_AXIS && (playerMax[Z_AXIS] <= minZ || playerMin[Z_AXIS] >= maxZ)) return distance;
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
  const minX = Math.floor(playerMin[X_AXIS] + (axis === X_AXIS ? backward : 0));
  const maxX = Math.ceil(playerMax[X_AXIS] + (axis === X_AXIS ? forward : 0));
  const minY = Math.floor(playerMin[Y_AXIS] + (axis === Y_AXIS ? backward : 0));
  const maxY = Math.ceil(playerMax[Y_AXIS] + (axis === Y_AXIS ? forward : 0));
  const minZ = Math.floor(playerMin[Z_AXIS] + (axis === Z_AXIS ? backward : 0));
  const maxZ = Math.ceil(playerMax[Z_AXIS] + (axis === Z_AXIS ? forward : 0));
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
    if (axis !== Y_AXIS && isHeldAtEdge) {
      setPlayerBox(position, height);
      const probe = -2 * COLLISION_GAP;
      if (clipAlongAxis(voxelWorld, worldBoxes, Y_AXIS, probe) === probe) {
        position.setComponent(axis, start);
        step.setComponent(axis, 0);
        continue;
      }
    }
    if (clippedDistance !== distance) step.setComponent(axis, 0);
  }
};
