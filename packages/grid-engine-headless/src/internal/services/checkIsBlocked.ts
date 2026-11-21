import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { Position } from "#src/models/Position";

import { checkIsOccupying } from "#src/internal/services/checkIsOccupying";

// A position blocks unless its tile is open. An absent tile and a position off the grid are not open, and nor is a tile
// A character holds
export const checkIsBlocked = (state: GridEngineState, position: Position): boolean => {
  const isOpenTile = state.tiles[position.y]?.[position.x] === false;
  return !isOpenTile || [...state.characters.values()].some((character) => checkIsOccupying(character, position));
};
