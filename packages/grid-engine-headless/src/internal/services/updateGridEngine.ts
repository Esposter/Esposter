import type { GridEngineState } from "#src/internal/models/GridEngineState";

import { advanceCharacter } from "#src/internal/services/advanceCharacter";

export const updateGridEngine = (state: GridEngineState, delta: number): void => {
  for (const character of state.characters.values()) advanceCharacter(state, character, delta);
};
