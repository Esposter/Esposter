import type { Camera } from "three";

import { WORLD_HEIGHT } from "@/services/agentConsole/world/constants";
import { Vector3 } from "three";

// The eight corners of the camera's frustum, from its near plane to its far one, the bit of each axis set in a
// Corner's index where it is on that axis's positive side, reused so a frame allocates nothing
const corners = Array.from({ length: 8 }, () => new Vector3());
const AXIS_BITS = [1, 2, 4];
const point = new Vector3();
// How far across the ground a point a share of the way along an edge stands from the center
const getGroundDistance = (start: Vector3, end: Vector3, ratio: number, center: Vector3) => {
  point.lerpVectors(start, end, ratio);
  return Math.hypot(point.x - center.x, point.z - center.z);
};
// How far from a point, across the ground, the camera can see anything the world holds: the most any point of its
// Frustum stands from it, between the world's floor and its ceiling. Across the ground a distance is greatest at a
// Corner of that shape, which is a corner of the frustum or where one of its edges crosses the floor or the ceiling
export const getViewReach = (camera: Camera, center: Vector3) => {
  for (const [index, corner] of corners.entries())
    corner.set(index & 1 ? 1 : -1, index & 2 ? 1 : -1, index & 4 ? 1 : -1).unproject(camera);

  let reach = 0;
  for (const [index, start] of corners.entries())
    for (const axisBit of AXIS_BITS) {
      const end = corners[index | axisBit];
      if (index & axisBit || !end) continue;
      // The share of the edge between the floor and the ceiling, none of it where it runs level outside them
      const deltaY = end.y - start.y;
      if (deltaY === 0 && (start.y < 0 || start.y > WORLD_HEIGHT)) continue;
      const floorRatio = deltaY === 0 ? 0 : -start.y / deltaY;
      const ceilingRatio = deltaY === 0 ? 1 : (WORLD_HEIGHT - start.y) / deltaY;
      const minRatio = Math.max(Math.min(floorRatio, ceilingRatio), 0);
      const maxRatio = Math.min(Math.max(floorRatio, ceilingRatio), 1);
      if (minRatio > maxRatio) continue;
      reach = Math.max(
        reach,
        getGroundDistance(start, end, minRatio, center),
        getGroundDistance(start, end, maxRatio, center),
      );
    }
  return reach;
};
