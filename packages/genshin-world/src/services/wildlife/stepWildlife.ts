import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { GroundPoint } from "genshin-engine";

import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import { WILDLIFE_ESCAPE_RADIUS, WILDLIFE_ESCAPE_SECONDS, WILDLIFE_FLEE_SPEED } from "#src/services/wildlife/constants";

const computeDistance = (from: GroundPoint, to: GroundPoint): number => Math.hypot(to.x - from.x, to.z - from.z);

const setWildlifeState = (wildlife: Wildlife, state: WildlifeState): void => {
  wildlife.state = state;
  wildlife.stateSeconds = 0;
};
// One fixed step of an animal's flight toward a target on the ground, the character's feet, or none, written into the
// Animal in place. An idle one within the escape radius of the target starts running, and a running one keeps running
// Until its escape time has passed. It is then idle again, or running again if the target is still in reach, and a
// Target that is gone leaves it idle once its time is up. Running is straight away from the target, at the flight speed
export const stepWildlife = (wildlife: Wildlife, target: GroundPoint | undefined, stepSeconds: number): void => {
  wildlife.stateSeconds += stepSeconds;
  const isInReach = target !== undefined && computeDistance(wildlife.position, target) <= WILDLIFE_ESCAPE_RADIUS;
  if (wildlife.state === WildlifeState.Idle) {
    if (!isInReach) return;
    setWildlifeState(wildlife, WildlifeState.Fleeing);
  } else if (wildlife.stateSeconds >= WILDLIFE_ESCAPE_SECONDS)
    setWildlifeState(wildlife, isInReach ? WildlifeState.Fleeing : WildlifeState.Idle);

  if (wildlife.state !== WildlifeState.Fleeing || target === undefined) return;
  wildlife.heading = Math.atan2(wildlife.position.x - target.x, wildlife.position.z - target.z);
  wildlife.position.x += Math.sin(wildlife.heading) * WILDLIFE_FLEE_SPEED * stepSeconds;
  wildlife.position.z += Math.cos(wildlife.heading) * WILDLIFE_FLEE_SPEED * stepSeconds;
};
