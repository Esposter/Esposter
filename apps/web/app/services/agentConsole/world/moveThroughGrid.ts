import type { VoxelWorld } from "@/models/agentConsole/world/VoxelWorld";
import type { Vector3 } from "three";

import { COLLISION_GAP, PLAYER_HALF_WIDTH } from "@/services/agentConsole/world/constants";
import { getWorldVoxel } from "@/services/agentConsole/world/getWorldVoxel";

const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
// Minecraft's order: up or down first, then x, then z
const AXIS_ORDER = [Y_AXIS, X_AXIS, Z_AXIS];
// Whether the player's box, its feet at a point, overlaps a solid voxel
const checkIsBlocked = (voxelWorld: VoxelWorld, { x, y, z }: Vector3, height: number) => {
  const minX = Math.floor(x - PLAYER_HALF_WIDTH);
  const maxX = Math.ceil(x + PLAYER_HALF_WIDTH) - 1;
  const minZ = Math.floor(z - PLAYER_HALF_WIDTH);
  const maxZ = Math.ceil(z + PLAYER_HALF_WIDTH) - 1;
  for (let voxelZ = minZ; voxelZ <= maxZ; voxelZ++)
    for (let voxelY = Math.floor(y); voxelY < Math.ceil(y + height); voxelY++)
      for (let voxelX = minX; voxelX <= maxX; voxelX++)
        if (getWorldVoxel(voxelWorld, voxelX, voxelY, voxelZ)) return true;
  return false;
};
// Whether anything solid is under the box's footprint, just below its feet
const checkIsSupported = (voxelWorld: VoxelWorld, { x, y, z }: Vector3) => {
  const voxelY = Math.floor(y - COLLISION_GAP * 2);
  for (let voxelZ = Math.floor(z - PLAYER_HALF_WIDTH); voxelZ < Math.ceil(z + PLAYER_HALF_WIDTH); voxelZ++)
    for (let voxelX = Math.floor(x - PLAYER_HALF_WIDTH); voxelX < Math.ceil(x + PLAYER_HALF_WIDTH); voxelX++)
      if (getWorldVoxel(voxelWorld, voxelX, voxelY, voxelZ)) return true;
  return false;
};
// The step along one axis, cut short at the face of the first solid voxel it would enter. The box reaches from its
// Feet to its height along y, and a half width either way along x and z
const moveAlongAxis = (
  voxelWorld: VoxelWorld,
  position: Vector3,
  step: Vector3,
  axis: number,
  height: number,
  isHeldAtEdge: boolean,
) => {
  const stepLength = step.getComponent(axis);
  if (stepLength === 0) return;
  const start = position.getComponent(axis);
  position.setComponent(axis, start + stepLength);
  const isSideways = axis !== Y_AXIS;
  if (isSideways && isHeldAtEdge && !checkIsSupported(voxelWorld, position)) {
    position.setComponent(axis, start);
    step.setComponent(axis, 0);
    return;
  } else if (!checkIsBlocked(voxelWorld, position, height)) return;
  const lowerExtent = isSideways ? PLAYER_HALF_WIDTH : 0;
  const upperExtent = isSideways ? PLAYER_HALF_WIDTH : height;
  const end = start + stepLength;
  position.setComponent(
    axis,
    stepLength > 0
      ? Math.floor(end + upperExtent) - upperExtent - COLLISION_GAP
      : Math.floor(end - lowerExtent) + 1 + lowerExtent + COLLISION_GAP,
  );
  step.setComponent(axis, 0);
};
// One step of the player's box, resolved one axis at a time, so a step into a wall at an angle slides along it and a
// Fall stops on the ground. A blocked axis's step is zeroed, so the caller stops its velocity along that axis. Held at
// An edge, as a sneaking player on the ground is, a sideways step that would leave nothing under the feet is not
// Taken. Correct only while a step stays well under a voxel, which a step of the simulation always does
export const moveThroughGrid = (
  voxelWorld: VoxelWorld,
  position: Vector3,
  step: Vector3,
  height: number,
  isHeldAtEdge: boolean,
) => {
  for (const axis of AXIS_ORDER) moveAlongAxis(voxelWorld, position, step, axis, height, isHeldAtEdge);
};
