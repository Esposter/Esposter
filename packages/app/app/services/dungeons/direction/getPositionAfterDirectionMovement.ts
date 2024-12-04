import type { Position } from "grid-engine";

import { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import { Direction } from "grid-engine";

const BaseInteractivePlayerPositionOffsetMap = {
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.UP]: { x: 0, y: -1 },
} as const satisfies Record<InteractableDirection, Position>;

const InteractivePlayerPositionOffsetMap = {
  ...BaseInteractivePlayerPositionOffsetMap,
  [Direction.DOWN_LEFT]: {
    x:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN].x +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT].x,
    y:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN].y +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT].y,
  },
  [Direction.DOWN_RIGHT]: {
    x:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN].x +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT].x,
    y:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.DOWN].y +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT].y,
  },
  [Direction.NONE]: { x: 0, y: 0 },
  [Direction.UP_LEFT]: {
    x:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP].x +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT].x,
    y:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP].y +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.LEFT].y,
  },
  [Direction.UP_RIGHT]: {
    x:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP].x +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT].x,
    y:
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.UP].y +
      BaseInteractivePlayerPositionOffsetMap[InteractableDirection.RIGHT].y,
  },
} as const satisfies Record<Direction, Position>;

export const getPositionAfterDirectionMovement = (position: Position, direction: Direction): Position => ({
  x: position.x + InteractivePlayerPositionOffsetMap[direction].x,
  y: position.y + InteractivePlayerPositionOffsetMap[direction].y,
});
