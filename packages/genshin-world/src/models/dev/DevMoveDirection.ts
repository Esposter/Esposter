// A direction a `hold` line moves the character in, named as the line spells it: `hold forward 2` holds the forward key
export enum DevMoveDirection {
  Backward = "backward",
  Down = "down",
  Forward = "forward",
  Left = "left",
  Right = "right",
  Up = "up",
}

export const DevMoveDirections: readonly DevMoveDirection[] = Object.values(DevMoveDirection);
