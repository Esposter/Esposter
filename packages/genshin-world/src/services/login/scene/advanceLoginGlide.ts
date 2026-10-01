import type { LoginGlide } from "#src/models/login/LoginGlide";

import { LoginStage } from "#src/models/login/LoginStage";
import {
  LOGIN_GLIDE_ACCELERATION,
  LOGIN_GLIDE_PREPARING_SPEED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";

// The glide a frame on: toward the title's speed while the title waits and the preparing speed once the game
// Prepares, gathering or losing speed at the glide's acceleration; once the door is due it keeps on to the first copy
// Of the walkway it can stop on at that rate, then slows to rest exactly there, so the door's copy stands where the
// Camera's pose has it
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
  const brakingDistance = speed ** 2 / (2 * LOGIN_GLIDE_ACCELERATION);
  const stop = stopAt ?? Math.ceil((scrolled + brakingDistance) / LOGIN_WALKWAY_ROW.length) * LOGIN_WALKWAY_ROW.length;
  const remaining = stop - scrolled;
  if (remaining <= 0) return { scrolled: stop, speed: 0, stopAt: stop };
  // Short of its braking distance, less a frame's travel, it cruises; within it, it slows at the one rate that comes
  // To rest on the stop, never more than the glide's own
  const deceleration = remaining > brakingDistance + speed * deltaSeconds ? 0 : speed ** 2 / (2 * remaining);
  const nextSpeed = Math.max(speed - deceleration * deltaSeconds, 0);
  const step = ((speed + nextSpeed) / 2) * deltaSeconds;
  return step >= remaining || nextSpeed === 0
    ? { scrolled: stop, speed: 0, stopAt: stop }
    : { scrolled: scrolled + step, speed: nextSpeed, stopAt: stop };
};
