import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { GroundPoint } from "genshin-engine";

import { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import {
  WILDLIFE_CHARGE_CONTACT,
  WILDLIFE_CHARGE_REACH,
  WILDLIFE_CHARGE_SPEED,
  WILDLIFE_ESCAPE_RADIUS,
  WILDLIFE_ESCAPE_SECONDS,
  WILDLIFE_FLEE_SPEED,
} from "#src/services/wildlife/constants";

const computeDistance = (from: GroundPoint, to: GroundPoint): number => Math.hypot(to.x - from.x, to.z - from.z);

const setWildlifeState = (wildlife: Wildlife, state: WildlifeState): void => {
  wildlife.state = state;
  wildlife.stateSeconds = 0;
};
// One fixed step of a boar's charge at the target, the character's feet, written into the boar in place. An idle boar in
// Charge reach of the target starts charging, and a charging one moves straight at the target until it makes contact, which
// Is its one hit: the boar then runs off as a fleeing animal does, so its next charge waits until the target is in reach
// Again. A target out of reach, or none, ends the charge where the boar stands. Returns whether this step's contact hit
const stepBoarCharge = (boar: Wildlife, target: GroundPoint | undefined, stepSeconds: number): boolean => {
  const distance = target === undefined ? Number.POSITIVE_INFINITY : computeDistance(boar.position, target);
  if (boar.state === WildlifeState.Idle) {
    if (distance <= WILDLIFE_CHARGE_REACH) setWildlifeState(boar, WildlifeState.Charging);
    return false;
  }
  if (distance > WILDLIFE_CHARGE_REACH || target === undefined) {
    setWildlifeState(boar, WildlifeState.Idle);
    return false;
  }
  if (distance <= WILDLIFE_CHARGE_CONTACT) {
    setWildlifeState(boar, WildlifeState.Fleeing);
    return true;
  }
  boar.heading = Math.atan2(target.x - boar.position.x, target.z - boar.position.z);
  boar.position.x += Math.sin(boar.heading) * WILDLIFE_CHARGE_SPEED * stepSeconds;
  boar.position.z += Math.cos(boar.heading) * WILDLIFE_CHARGE_SPEED * stepSeconds;
  return false;
};
// One fixed step of an animal's flight toward a target on the ground, the character's feet, or none, written into the
// Animal in place. An idle one within the escape radius of the target starts running, and a running one keeps running
// Until its escape time has passed. It is then idle again, or running again if the target is still in reach, and a
// Target that is gone leaves it running on its last heading until its time is up, then idle. Running is straight away
// From the target, at the flight speed. A struck one stays where it fell, its state and time unmoved. A boar charges
// Instead of running, as stepBoarCharge gives it, and returns whether its charge hit the target this step
export const stepWildlife = (wildlife: Wildlife, target: GroundPoint | undefined, stepSeconds: number): boolean => {
  if (wildlife.state === WildlifeState.Struck) return false;
  wildlife.stateSeconds += stepSeconds;
  if (wildlife.kind === WildlifeKind.Boar && wildlife.state !== WildlifeState.Fleeing)
    return stepBoarCharge(wildlife, target, stepSeconds);
  const isInReach = target !== undefined && computeDistance(wildlife.position, target) <= WILDLIFE_ESCAPE_RADIUS;
  if (wildlife.state === WildlifeState.Idle) {
    if (!isInReach) return false;
    setWildlifeState(wildlife, WildlifeState.Fleeing);
  } else if (wildlife.stateSeconds >= WILDLIFE_ESCAPE_SECONDS)
    setWildlifeState(wildlife, isInReach ? WildlifeState.Fleeing : WildlifeState.Idle);

  if (wildlife.state !== WildlifeState.Fleeing) return false;
  if (target !== undefined)
    wildlife.heading = Math.atan2(wildlife.position.x - target.x, wildlife.position.z - target.z);
  wildlife.position.x += Math.sin(wildlife.heading) * WILDLIFE_FLEE_SPEED * stepSeconds;
  wildlife.position.z += Math.cos(wildlife.heading) * WILDLIFE_FLEE_SPEED * stepSeconds;
  return false;
};
