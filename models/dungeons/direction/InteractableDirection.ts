import { Direction } from "grid-engine";

export const InteractableDirection = {
  UP: Direction.UP,
  DOWN: Direction.DOWN,
  LEFT: Direction.LEFT,
  RIGHT: Direction.RIGHT,
} as const;
export type InteractableDirection = (typeof InteractableDirection)[keyof typeof InteractableDirection];
