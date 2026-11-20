import type { Position } from "grid-engine-headless";

import { Direction } from "grid-engine-headless";

// The tile a step in each direction moves the character onto. A diagonal or no direction steps nowhere
export const StepDeltaMap = {
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.DownLeft]: { x: 0, y: 0 },
  [Direction.DownRight]: { x: 0, y: 0 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.None]: { x: 0, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Up]: { x: 0, y: -1 },
  [Direction.UpLeft]: { x: 0, y: 0 },
  [Direction.UpRight]: { x: 0, y: 0 },
} as const satisfies Record<Direction, Position>;
