import type { Position } from "grid-engine";

import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import { Direction } from "grid-engine";

const addPositions = (first: Position, second: Position): Position => ({
  x: first.x + second.x,
  y: first.y + second.y,
});

const BaseInteractivePlayerPositionOffsetMap = {
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.UP]: { x: 0, y: -1 },
} as const satisfies Record<InteractableDirection, Position>;
// A diagonal is its two component directions travelled at once
const InteractivePlayerPositionOffsetMap = {
  ...BaseInteractivePlayerPositionOffsetMap,
  [Direction.DOWN_LEFT]: addPositions(
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN],
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT],
  ),
  [Direction.DOWN_RIGHT]: addPositions(
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN],
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT],
  ),
  [Direction.NONE]: { x: 0, y: 0 },
  [Direction.UP_LEFT]: addPositions(
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP],
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT],
  ),
  [Direction.UP_RIGHT]: addPositions(
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP],
    BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT],
  ),
} as const satisfies Record<Direction, Position>;

export const getPositionAfterDirectionMovement = (position: Position, direction: Direction): Position =>
  addPositions(position, InteractivePlayerPositionOffsetMap[direction]);
