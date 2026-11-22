import type { Types } from "phaser";

export interface VirtualJoystick {
  // Held down as a keyboard's arrow keys would be, so the joystick reads through the same controls as the keyboard
  cursorKeys: Pick<Types.Input.Keyboard.CursorKeys, "down" | "left" | "right" | "up">;
  destroy: () => void;
}
