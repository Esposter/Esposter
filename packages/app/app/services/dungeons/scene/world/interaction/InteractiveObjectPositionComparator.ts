import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Position } from "grid-engine";

import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";
import { Direction } from "grid-engine";

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
    [Direction.DOWN]: true,
    [Direction.LEFT]: true,
    [Direction.RIGHT]: true,
    [Direction.UP]: true,
  },
): boolean => {
  if (!isInteractableDirection(interactableDirectionMap, playerDirection)) return false;
  const newPlayerPosition = getPositionAfterDirectionMovement(playerPosition, playerDirection);
  return newPlayerPosition.x === objectPosition.x && newPlayerPosition.y === objectPosition.y;
};
