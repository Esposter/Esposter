import { Direction } from "grid-engine-headless";

export const InteractableDirection = {
  DOWN: Direction.Down,
  LEFT: Direction.Left,
  RIGHT: Direction.Right,
  UP: Direction.Up,
} as const;
export type InteractableDirection = (typeof InteractableDirection)[keyof typeof InteractableDirection];
