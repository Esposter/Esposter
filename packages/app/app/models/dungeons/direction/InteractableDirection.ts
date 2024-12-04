import { Direction } from "grid-engine";

export const InteractableDirection = {
  DOWN: Direction.DOWN,
  LEFT: Direction.LEFT,
  RIGHT: Direction.RIGHT,
  UP: Direction.UP,
} as const;
export type InteractableDirection = (typeof InteractableDirection)[keyof typeof InteractableDirection];
