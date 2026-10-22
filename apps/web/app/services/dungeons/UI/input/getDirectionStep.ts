import type { Direction } from "grid-engine";

// The step along an axis for a direction: -1 toward the axis's negative direction, +1 toward the other
export const getDirectionStep = (direction: Direction, negativeDirection: Direction) =>
  direction === negativeDirection ? -1 : 1;
