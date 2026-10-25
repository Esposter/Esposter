import type { Position } from "grid-engine";

export const addPositions = (first: Position, second: Position): Position => ({
  x: first.x + second.x,
  y: first.y + second.y,
});
