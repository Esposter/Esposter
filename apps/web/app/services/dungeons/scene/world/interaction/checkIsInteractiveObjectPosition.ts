import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Direction, Position } from "grid-engine";

import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";

// The player may be facing a diagonal or standing still, neither of which the map holds an entry for
const checkIsInteractableDirection = (
  interactableDirectionMap: Partial<Record<Direction, boolean>>,
  direction: Direction,
) => interactableDirectionMap[direction] === true;

export const checkIsInteractiveObjectPosition = (
  playerPosition: Position,
  playerDirection: Direction,
  objectPosition: Position,
  interactableDirectionMap: InteractableDirectionMap,
): boolean => {
  if (!checkIsInteractableDirection(interactableDirectionMap, playerDirection)) return false;
  const newPlayerPosition = getPositionAfterDirectionMovement(playerPosition, playerDirection);
  return newPlayerPosition.x === objectPosition.x && newPlayerPosition.y === objectPosition.y;
};
