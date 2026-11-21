import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { GridEngineStep } from "#src/models/GridEngineStep";

import { Direction } from "#src/models/Direction";
import { commitStep } from "#src/services/commitStep";
import { STEP_PROGRESS } from "#src/services/constants";
import { startStep } from "#src/services/startStep";
import { takeCarry } from "#src/services/takeCarry";

// Grows a step by a distance and commits it when it is full. The distance past the end is kept on the character before
// The listeners hear the commit, so a teleport from one drops it. A listener's move in the carry's direction
// Takes it in this same update. A move asked before the next update takes it there, and any other move drops it
export const spendDistance = (
  state: GridEngineState,
  character: GridEngineCharacter,
  step: GridEngineStep,
  distance: number,
): void => {
  let currentStep: GridEngineStep | undefined = step;
  let currentDistance = distance;
  while (currentStep !== undefined) {
    const needed = STEP_PROGRESS - currentStep.progress;
    if (currentDistance < needed) {
      currentStep.progress += currentDistance;
      return;
    }
    const leftover = currentDistance - needed;
    if (leftover > 0) character.carry = { direction: currentStep.direction, distance: leftover };
    else delete character.carry;
    commitStep(state, character, currentStep);
    if (character.pendingDirection === Direction.None) return;
    currentDistance = takeCarry(character, character.pendingDirection);
    currentStep = currentDistance > 0 ? startStep(state, character) : undefined;
  }
};
