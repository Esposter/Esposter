import type { Position } from "#src/models/Position";

export const checkIsSamePosition = (first: Position, second: Position): boolean =>
  first.x === second.x && first.y === second.y;
