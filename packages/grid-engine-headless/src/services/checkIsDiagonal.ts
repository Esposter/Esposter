import type { Direction } from "#src/models/Direction";

import { Direction as DirectionValues } from "#src/models/Direction";
import { DirectionDeltaMap } from "#src/services/DirectionDeltaMap";

// A direction is diagonal when it names a way to move that no tile step has, and none is not a direction to move in
export const checkIsDiagonal = (direction: Direction): boolean =>
  direction !== DirectionValues.None && DirectionDeltaMap[direction] === undefined;
