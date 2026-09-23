import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";
import type { Vector3 } from "three";

import { REACH_DISTANCE } from "@/services/agentConsole/world/constants";
// The nearest thing whose spot the player stands within reach of and whose middle the player faces, so a thing behind
// The player never prompts. The room holds a handful of things, so it is a scan of them all
export const findReachableObject = <T extends Pick<WorldPrompt, "max" | "min" | "standPosition">>(
  position: Vector3,
  heading: number,
  worldPrompts: readonly T[],
) => {
  const headingX = Math.sin(heading);
  const headingZ = Math.cos(heading);
  let reachableWorldPrompt: T | undefined;
  let reachableDistance = REACH_DISTANCE;

  for (const worldPrompt of worldPrompts) {
    const { max, min, standPosition } = worldPrompt;
    const distance = Math.hypot(standPosition[0] - position.x, standPosition[2] - position.z);
    const facing = headingX * ((min[0] + max[0]) / 2 - position.x) + headingZ * ((min[2] + max[2]) / 2 - position.z);
    if (distance > reachableDistance || facing <= 0) continue;
    reachableWorldPrompt = worldPrompt;
    reachableDistance = distance;
  }

  return reachableWorldPrompt;
};
