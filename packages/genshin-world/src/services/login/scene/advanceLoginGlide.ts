import type { LoginGlide } from "#src/models/login/LoginGlide";

import { LoginStage } from "#src/models/login/LoginStage";
import {
  LOGIN_DOOR_REST_DISTANCE,
  LOGIN_GLIDE_ACCELERATION,
  LOGIN_GLIDE_APPROACH_SECONDS,
  LOGIN_GLIDE_PREPARING_SPEED,
  LOGIN_GLIDE_TITLE_SPEED,
  LOGIN_WALKWAY_ROW,
} from "#src/services/login/scene/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";

// How much farther than its rest the door stands when it is first due, so it rises at the walkway's far end as the
// Last blocks settle, as the recording's does, rather than over walkway already built
const DOOR_LEAD = LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_DOOR_REST_DISTANCE;

// The copy of the walkway the door comes to rest on: the one nearest to where the glide's own pace would carry it over
// The approach, so it neither lurches nor crawls, and never nearer than the door's lead
const getApproachStop = (scrolled: number, speed: number): number => {
  const { length } = LOGIN_WALKWAY_ROW;
  const nearest = Math.round((scrolled + speed * LOGIN_GLIDE_APPROACH_SECONDS) / length) * length;
  return nearest - scrolled >= DOOR_LEAD ? nearest : Math.ceil((scrolled + DOOR_LEAD) / length) * length;
};

// The glide a frame on: toward the title's speed while the title waits and the preparing speed once the game
// Prepares, gathering or losing speed at the glide's acceleration. Once the door is due it comes to rest on its copy in
// Exactly the approach's time, along the one cubic that starts at the glide's speed then and ends still at the stop,
// So the walkway, which assembles by its distance from the camera, and the door riding on it move as the glide does
export const advanceLoginGlide = (glide: LoginGlide, stage: LoginStage, deltaSeconds: number): LoginGlide => {
  const { scrolled, speed } = glide;
  const isDoorDue = stage === LoginStage.Door || stage === LoginStage.Entering;
  if (!isDoorDue) {
    const target = stage === LoginStage.Preparing ? LOGIN_GLIDE_PREPARING_SPEED : LOGIN_GLIDE_TITLE_SPEED;
    const change =
      Math.sign(target - speed) * Math.min(Math.abs(target - speed), LOGIN_GLIDE_ACCELERATION * deltaSeconds);
    return { scrolled: scrolled + speed * deltaSeconds, speed: speed + change };
  }
  const stopAt = glide.stopAt ?? getApproachStop(scrolled, speed);
  const { elapsedSeconds, startScrolled, startSpeed } = glide.approach ?? {
    elapsedSeconds: 0,
    startScrolled: scrolled,
    startSpeed: speed,
  };
  const nextElapsedSeconds = Math.min(elapsedSeconds + deltaSeconds, LOGIN_GLIDE_APPROACH_SECONDS);
  const approach = { elapsedSeconds: nextElapsedSeconds, startScrolled, startSpeed };
  const share = nextElapsedSeconds / LOGIN_GLIDE_APPROACH_SECONDS;
  const distance = stopAt - startScrolled;
  const startTravel = startSpeed * LOGIN_GLIDE_APPROACH_SECONDS;
  return {
    approach,
    scrolled:
      startScrolled +
      distance * (3 * share ** 2 - 2 * share ** 3) +
      startTravel * (share - 2 * share ** 2 + share ** 3),
    speed:
      (distance * (6 * share - 6 * share ** 2) + startTravel * (1 - 4 * share + 3 * share ** 2)) /
      LOGIN_GLIDE_APPROACH_SECONDS,
    stopAt,
  };
};
