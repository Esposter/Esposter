// What a screen open over the world does to it
export interface ScreenBehaviour {
  // Whether the world's fixed-step loops and its clock stand still, as the game's simulation does under a menu
  isHeld: boolean;
  isHudHidden: boolean;
  // Whether the pointer is let go for the screen's own cursor, rather than kept locked to turn the camera
  isPointerReleased: boolean;
}
