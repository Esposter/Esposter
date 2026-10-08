// What the HUD reads off the world each frame, written by the world screen into one reactive object it hands down
// Whole, so a change re-renders only the piece reading it: the party's stamina, and where the follow camera's pivot
// Over the character stands on the screen, as shares of its width and height
export interface HudFrame {
  pivotX: number;
  pivotY: number;
  stamina: number;
}
