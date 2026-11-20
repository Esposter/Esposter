import type { GridEngineCharacter } from "#src/models/GridEngineCharacter";
import type { Position } from "#src/models/Position";

import { checkIsSamePosition } from "#src/services/checkIsSamePosition";

// A character holds the tile it stands on and the tile it is stepping onto, so no other character may enter either
export const checkIsOccupying = (character: GridEngineCharacter, position: Position): boolean =>
  checkIsSamePosition(character.position, position) ||
  (character.step !== undefined && checkIsSamePosition(character.step.enterTile, position));
