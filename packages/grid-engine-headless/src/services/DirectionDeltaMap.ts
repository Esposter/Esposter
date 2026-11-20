import type { Position } from "#src/models/Position";

import { Direction } from "#src/models/Direction";

// The tile one step in each cardinal direction reaches. A diagonal or none has no entry, so its lookup is undefined
export const DirectionDeltaMap: Partial<Record<Direction, Position>> = {
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Up]: { x: 0, y: -1 },
};
