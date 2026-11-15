// A direction a `hold` line moves the character in, named as the line spells it: `hold forward 2` holds the forward key
export const DevMoveDirection = {
  Backward: "backward",
  Down: "down",
  Forward: "forward",
  Left: "left",
  Right: "right",
  Up: "up",
} as const;
export type DevMoveDirection = (typeof DevMoveDirection)[keyof typeof DevMoveDirection];

export const DevMoveDirections: readonly DevMoveDirection[] = Object.values(DevMoveDirection);
