import type { GridEngine } from "#src/models/GridEngine";
import type { GridEngineState } from "#src/models/GridEngineState";

import { addCharacter } from "#src/services/addCharacter";
import { addListener } from "#src/services/addListener";
import { checkIsBlocked } from "#src/services/checkIsBlocked";
import { queueMove } from "#src/services/queueMove";
import { teleportCharacter } from "#src/services/teleportCharacter";
import { turnCharacter } from "#src/services/turnCharacter";
import { updateGridEngine } from "#src/services/updateGridEngine";

// Each call closes over the state the engine was made with, so an engine made later shares none of it
export const createEngine = (state: GridEngineState): GridEngine => ({
  addCharacter: (config) => addCharacter(state, config),
  checkHasCharacter: (id) => state.characters.has(id),
  checkIsBlocked: (position) => checkIsBlocked(state, position),
  move: (id, direction) => queueMove(state, id, direction),
  on: (event, listener) => addListener(state, event, listener),
  setPosition: (id, position) => teleportCharacter(state, id, position),
  turnTowards: (id, direction) => turnCharacter(state, id, direction),
  update: (delta) => {
    updateGridEngine(state, delta);
  },
});
