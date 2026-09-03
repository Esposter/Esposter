import type { InteractableDirection } from "@/models/dungeons/direction/InteractableDirection";
import type { InteractableDirectionMap } from "@/models/dungeons/direction/InteractableDirectionMap";
import type { Direction, Position } from "grid-engine";

import { DEFAULT_INTERACTABLE_DIRECTION_MAP } from "@/services/dungeons/direction/constants";
import { getPositionAfterDirectionMovement } from "@/services/dungeons/direction/getPositionAfterDirectionMovement";

const checkIsInteractableDirection = (
  interactableDirectionMap: InteractableDirectionMap,
  direction: Direction,
): direction is InteractableDirection =>
  direction in interactableDirectionMap && interactableDirectionMap[direction as keyof InteractableDirectionMap];

export const checkIsInteractiveObjectPosition = (
  playerPosition: Position,
  playerDirection: Direction,
  objectPosition: Position,
  interactableDirectionMap: InteractableDirectionMap = DEFAULT_INTERACTABLE_DIRECTION_MAP,
): boolean => {
  if (!checkIsInteractableDirection(interactableDirectionMap, playerDirection)) return false;
  const newPlayerPosition = getPositionAfterDirectionMovement(playerPosition, playerDirection);
  return newPlayerPosition.x === objectPosition.x && newPlayerPosition.y === objectPosition.y;
};
