import type { Position } from "grid-engine-headless";

import { InteractableDirection } from "#src/models/dungeons/direction/InteractableDirection";
import { addPositions } from "#src/services/dungeons/direction/addPositions";
import { Direction } from "grid-engine-headless";

const BaseDirectionPositionOffsetMap = {
  [Direction.Down]: { x: 0, y: 1 },
  [Direction.Left]: { x: -1, y: 0 },
  [Direction.Right]: { x: 1, y: 0 },
  [Direction.Up]: { x: 0, y: -1 },
} as const satisfies Record<InteractableDirection, Position>;
// A diagonal is its two component directions travelled at once
const DirectionPositionOffsetMap = {
  ...BaseDirectionPositionOffsetMap,
  [Direction.DownLeft]: addPositions(
    BaseDirectionPositionOffsetMap[InteractableDirection.DOWN],
    BaseDirectionPositionOffsetMap[InteractableDirection.LEFT],
  ),
  [Direction.DownRight]: addPositions(
    BaseDirectionPositionOffsetMap[InteractableDirection.DOWN],
    BaseDirectionPositionOffsetMap[InteractableDirection.RIGHT],
  ),
  [Direction.None]: { x: 0, y: 0 },
  [Direction.UpLeft]: addPositions(
    BaseDirectionPositionOffsetMap[InteractableDirection.UP],
    BaseDirectionPositionOffsetMap[InteractableDirection.LEFT],
  ),
  [Direction.UpRight]: addPositions(
    BaseDirectionPositionOffsetMap[InteractableDirection.UP],
    BaseDirectionPositionOffsetMap[InteractableDirection.RIGHT],
  ),
} as const satisfies Record<Direction, Position>;

export const getPositionAfterDirectionMovement = (position: Position, direction: Direction): Position =>
  addPositions(position, DirectionPositionOffsetMap[direction]);
