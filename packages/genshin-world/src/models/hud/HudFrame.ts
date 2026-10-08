// What the HUD reads off the world each frame, written by the world screen into one reactive object it hands down
// Whole, so a change re-renders only the piece reading it: the party's stamina, where the follow camera's pivot over the
// Character stands on the screen as shares of its width and height, and the world's clock in seconds
export interface HudFrame {
  pivotX: number;
  pivotY: number;
  seconds: number;
  stamina: number;
}
