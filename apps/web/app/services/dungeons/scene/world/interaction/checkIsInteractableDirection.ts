import type { Direction } from "grid-engine";

// The player may be facing a diagonal or standing still, neither of which the map holds an entry for
export const checkIsInteractableDirection = (
  interactableDirectionMap: Partial<Record<Direction, boolean>>,
  direction: Direction,
) => interactableDirectionMap[direction] === true;
