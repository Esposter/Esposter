import { MOUSE_BUTTONS } from "genshin-engine";

// Sends the event the input reads for each code pressed or let go: a mouse button as a mouse event numbered as the mouse
// numbers its buttons, and any other code, a keyboard's or a gamepad's, as a keyboard event carrying the code
export const dispatchHoldCodes = (
  target: Pick<Window, "dispatchEvent">,
  { codes, isPressed }: { codes: readonly string[]; isPressed: boolean },
): void => {
  for (const code of codes) {
    const button = MOUSE_BUTTONS.findIndex((mouseButton) => mouseButton === code);
    if (button === -1) target.dispatchEvent(new KeyboardEvent(isPressed ? "keydown" : "keyup", { code }));
    else target.dispatchEvent(new MouseEvent(isPressed ? "mousedown" : "mouseup", { button }));
  }
};
