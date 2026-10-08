import type { LocomotionPhase } from "#src/models/locomotion/LocomotionPhase";
import type { Stamina } from "#src/models/locomotion/Stamina";

import {
  CLIMB_JUMP_STAMINA_COST,
  CLIMB_STAMINA_PER_SECOND,
  DASH_STAMINA_COST,
  GLIDE_STAMINA_PER_SECOND,
  SPRINT_STAMINA_PER_SECOND,
  STAMINA_MAX,
  STAMINA_REFILL_DELAY_SECONDS,
  STAMINA_REFILL_PER_SECOND,
  STAMINA_REFILL_STATES,
  SWIM_DASH_STAMINA_COST,
  SWIM_DASH_STAMINA_PER_SECOND,
  SWIM_STROKE_SECONDS,
  SWIM_STROKE_STAMINA_COST,
} from "#src/locomotion/constants";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";

// What a step in the state costs: a dash, a climb's jump and a swim's dash on entering, a sprint, a glide and a swim's
// Dash by the second, a climb by the second it moves, and a swim by the stroke, one as it starts and one each stroke on
const computeSpend = (
  { state, stateSeconds }: LocomotionPhase,
  isEntered: boolean,
  isMoving: boolean,
  stepSeconds: number,
): number => {
  if (state === LocomotionState.Climb) return isMoving ? CLIMB_STAMINA_PER_SECOND * stepSeconds : 0;
  else if (state === LocomotionState.ClimbJump) return isEntered ? CLIMB_JUMP_STAMINA_COST : 0;
  else if (state === LocomotionState.Dash) return isEntered ? DASH_STAMINA_COST : 0;
  else if (state === LocomotionState.Glide) return GLIDE_STAMINA_PER_SECOND * stepSeconds;
  else if (state === LocomotionState.Sprint) return SPRINT_STAMINA_PER_SECOND * stepSeconds;
  else if (state === LocomotionState.Swim)
    return Math.floor(stateSeconds / SWIM_STROKE_SECONDS) >
      Math.floor((stateSeconds - stepSeconds) / SWIM_STROKE_SECONDS)
      ? SWIM_STROKE_STAMINA_COST
      : 0;
  else if (state === LocomotionState.SwimDash)
    return (isEntered ? SWIM_DASH_STAMINA_COST : 0) + (isMoving ? SWIM_DASH_STAMINA_PER_SECOND * stepSeconds : 0);
  else return 0;
};
// The party's stamina, full to start. A step spends what its state costs, never below none; with nothing spent it
// Refills once the body has rested the delay in a state that refills, and the rest restarts in any other
export const createStamina = (): Stamina => {
  let restSeconds = 0;
  const stamina: Stamina = {
    refill: () => {
      stamina.value = STAMINA_MAX;
    },
    step: (phase, isEntered, isMoving, stepSeconds) => {
      const spend = computeSpend(phase, isEntered, isMoving, stepSeconds);
      if (spend > 0) {
        stamina.value = Math.max(0, stamina.value - spend);
        restSeconds = 0;
      } else if (STAMINA_REFILL_STATES.includes(phase.state)) {
        restSeconds += stepSeconds;
        if (restSeconds >= STAMINA_REFILL_DELAY_SECONDS)
          stamina.value = Math.min(STAMINA_MAX, stamina.value + STAMINA_REFILL_PER_SECOND * stepSeconds);
      } else restSeconds = 0;
    },
    value: STAMINA_MAX,
  };
  return stamina;
};
