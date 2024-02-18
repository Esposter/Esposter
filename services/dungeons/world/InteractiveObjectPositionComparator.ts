import { type InteractableDirection } from "@/models/dungeons/InteractableDirection";
import { Direction, type Position } from "grid-engine";

export type InteractableDirectionMap = Record<InteractableDirection, boolean>;

const InteractiveObjectPositionOffsetMap = {
  [Direction.UP]: { x: 0, y: 1 },
  [Direction.DOWN]: { x: 0, y: -1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 },
} as const satisfies Record<InteractableDirection, Position>;

const isInteractableDirection = (
  interactableDirectionMap: InteractableDirectionMap,
  direction: Direction,
): direction is InteractableDirection =>
  direction in interactableDirectionMap && interactableDirectionMap[direction as keyof InteractableDirectionMap];

export const InteractiveObjectPositionComparator = (
  playerPosition: Position,
  playerDirection: Direction,
  objectPosition: Position,
  interactableDirectionMap: InteractableDirectionMap = {
    [Direction.UP]: true,
    [Direction.DOWN]: true,
    [Direction.LEFT]: true,
    [Direction.RIGHT]: true,
  },
): boolean => {
  if (!isInteractableDirection(interactableDirectionMap, playerDirection)) return false;
  return (
    playerPosition.x === objectPosition.x + InteractiveObjectPositionOffsetMap[playerDirection].x &&
    playerPosition.y === objectPosition.y + InteractiveObjectPositionOffsetMap[playerDirection].y
  );
};
