import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";

import { commitStep } from "#src/services/commitStep";
import { STEP_PROGRESS } from "#src/services/constants";
import { startStep } from "#src/services/startStep";

// One update for one character: a waiting move starts first, then its step grows by the speed times the delta, and a
// Full step is committed. The step started here grows in this same update, and one a listener asks for is left to the next
export const advanceCharacter = (state: GridEngineState, character: GridEngineCharacter, delta: number): void => {
  const step = character.step ?? startStep(state, character);
  if (step === undefined) return;
  step.progress += character.speed * delta;
  if (step.progress >= STEP_PROGRESS) commitStep(character, step);
};
