import type { LoginGlide } from "#src/models/login/LoginGlide";

import { LoginStage } from "#src/models/login/LoginStage";
import {
  LOGIN_DOOR_REST_DISTANCE,
  LOGIN_GLIDE_ACCELERATION,
  LOGIN_GLIDE_PREPARING_SPEED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";

// How much farther than its rest the door stands when the walkway's far end reaches it, which is where it rises
const DOOR_LEAD = LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_DOOR_REST_DISTANCE;

// The glide a frame on: toward the title's speed while the title waits and the preparing speed once the game
// Prepares, gathering or losing speed at the glide's acceleration. Once the door is due it keeps its pace, never
// Faster, until the first copy of the walkway at least the door's lead away has come within the walkway's far end,
// Where the door rises, then slows evenly to rest on that copy, so the door's copy stands where the camera's pose has it
export const advanceLoginGlide = (
  { scrolled, speed, stopAt }: LoginGlide,
  stage: LoginStage,
  deltaSeconds: number,
): LoginGlide => {
  const isDoorDue = stage === LoginStage.Door || stage === LoginStage.Entering;
  if (!isDoorDue) {
    const target = stage === LoginStage.Preparing ? LOGIN_GLIDE_PREPARING_SPEED : LOGIN_GLIDE_TITLE_SPEED;
    const change =
      Math.sign(target - speed) * Math.min(Math.abs(target - speed), LOGIN_GLIDE_ACCELERATION * deltaSeconds);
    return { scrolled: scrolled + speed * deltaSeconds, speed: speed + change };
  }
  const stop = stopAt ?? Math.ceil((scrolled + DOOR_LEAD) / LOGIN_WALKWAY_ROW.length) * LOGIN_WALKWAY_ROW.length;
  const remaining = stop - scrolled;
  if (remaining <= 0 || speed === 0) return { scrolled: stop, speed: 0, stopAt: stop };
  if (remaining > DOOR_LEAD) return { scrolled: scrolled + speed * deltaSeconds, speed, stopAt: stop };
  // Within the door's lead it slows at the one even rate that comes to rest on the stop
  const deceleration = speed ** 2 / (2 * remaining);
  const nextSpeed = Math.max(speed - deceleration * deltaSeconds, 0);
  const step = ((speed + nextSpeed) / 2) * deltaSeconds;
  return step >= remaining || nextSpeed === 0
    ? { scrolled: stop, speed: 0, stopAt: stop }
    : { scrolled: scrolled + step, speed: nextSpeed, stopAt: stop };
};
