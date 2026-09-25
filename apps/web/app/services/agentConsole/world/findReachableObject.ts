import type { WorldBox } from "@/models/agentConsole/world/WorldBox";
import type { Vector3 } from "three";

import { REACH_DISTANCE } from "@/services/agentConsole/world/constants";

// The nearest thing within reach of the player and in front of it, as Minecraft reaches for a block: reach is measured
// To the nearest point of the thing's own box, so a thing is in reach from any side, and a thing behind the player
// Never prompts. The room holds a handful of things, so it is a scan of them all
export const findReachableObject = <T extends WorldBox>(
  position: Vector3,
  heading: number,
  worldBoxes: readonly T[],
) => {
  const headingX = Math.sin(heading);
  const headingZ = Math.cos(heading);
  let reachableWorldBox: T | undefined;
  let reachableDistance = REACH_DISTANCE;

  for (const worldBox of worldBoxes) {
    const { max, min } = worldBox;
    const nearestX = Math.min(Math.max(position.x, min[0]), max[0]);
    const nearestZ = Math.min(Math.max(position.z, min[2]), max[2]);
    const distance = Math.hypot(nearestX - position.x, nearestZ - position.z);
    const facing = headingX * ((min[0] + max[0]) / 2 - position.x) + headingZ * ((min[2] + max[2]) / 2 - position.z);
    if (distance > reachableDistance || facing <= 0) continue;
    reachableWorldBox = worldBox;
    reachableDistance = distance;
  }

  return reachableWorldBox;
};
