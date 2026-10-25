import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Direction, Position } from "grid-engine";

import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";
import { checkIsInteractableDirection } from "@/services/dungeons/scene/world/interaction/checkIsInteractableDirection";

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
