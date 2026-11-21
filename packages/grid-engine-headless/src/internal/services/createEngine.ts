import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngine } from "#src/models/GridEngine";

import { addCharacter } from "#src/internal/services/addCharacter";
import { addListener } from "#src/internal/services/addListener";
import { checkIsBlocked } from "#src/internal/services/checkIsBlocked";
import { queueMove } from "#src/internal/services/queueMove";
import { readCharacterState } from "#src/internal/services/readCharacterState";
import { teleportCharacter } from "#src/internal/services/teleportCharacter";
import { turnCharacter } from "#src/internal/services/turnCharacter";
import { updateGridEngine } from "#src/internal/services/updateGridEngine";

// Each call closes over the state the engine was made with, so an engine made later shares none of it
export const createEngine = (state: GridEngineState): GridEngine => ({
  addCharacter: (config) => addCharacter(state, config),
  checkHasCharacter: (id) => state.characters.has(id),
  checkIsBlocked: (position) => checkIsBlocked(state, position),
  move: (id, direction) => queueMove(state, id, direction),
  on: (event, listener) => addListener(state, event, listener),
  readCharacter: (id) => readCharacterState(state, id),
  setPosition: (id, position) => teleportCharacter(state, id, position),
  turnTowards: (id, direction) => turnCharacter(state, id, direction),
  update: (delta) => {
    updateGridEngine(state, delta);
  },
});
