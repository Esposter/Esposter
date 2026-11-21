import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { GridEngineState } from "#src/models/GridEngineState";

import { spendDistance } from "#src/services/spendDistance";
import { startStep } from "#src/services/startStep";
import { takeCarry } from "#src/services/takeCarry";

// One update for one character. A step under way grows by the speed times the delta. Otherwise a waiting move starts a
// Step, which takes the carry the last update left when that carry is in the move's direction.
// An update with no move waiting drops the carry
export const advanceCharacter = (state: GridEngineState, character: GridEngineCharacter, delta: number): void => {
  const distance = character.speed * delta;
  if (character.step !== undefined) {
    spendDistance(state, character, character.step, distance);
    return;
  }
  const carried = takeCarry(character, character.pendingDirection);
  const step = startStep(state, character);
  if (step !== undefined) spendDistance(state, character, step, distance + carried);
};
