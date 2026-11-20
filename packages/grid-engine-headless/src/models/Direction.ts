// The nine directions a character faces or moves in. Only the four cardinal ones are steps, and the others are for a
// Facing, the way a sprite is drawn, so a diagonal move is refused rather than taken
export const Direction = {
  Down: "down",
  DownLeft: "down-left",
  DownRight: "down-right",
  Left: "left",
  None: "none",
  Right: "right",
  Up: "up",
  UpLeft: "up-left",
  UpRight: "up-right",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];
