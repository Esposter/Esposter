import type { FixedStepLoop } from "#src/models/simulation/FixedStepLoop";

import { MAX_STEPS_PER_FRAME } from "#src/simulation/constants";

// Runs `step` in fixed steps of `stepSeconds` from an accumulator, so a motion is the same at any frame rate. A frame
// Owed more than the most steps drops what it cannot run, rather than spiralling further behind the frames
export const createFixedStepLoop = (stepSeconds: number, step: () => void): FixedStepLoop => {
  let accumulator = 0;
  return {
    advance: (deltaSeconds) => {
      accumulator += deltaSeconds;
      let stepCount = 0;
      while (accumulator >= stepSeconds && stepCount < MAX_STEPS_PER_FRAME) {
        step();
        accumulator -= stepSeconds;
        stepCount += 1;
      }
      if (accumulator >= stepSeconds) accumulator = 0;
    },
  };
};
