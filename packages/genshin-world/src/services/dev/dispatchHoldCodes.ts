import { checkIsEnumValue } from "@esposter/shared";
import { MOUSE_BUTTONS, MouseButton } from "genshin-engine";

// Sends the event the input reads for each code pressed or let go: a mouse button as a mouse event numbered as the mouse
// Numbers its buttons, and any other code, a keyboard's or a gamepad's, as a keyboard event carrying the code
export const dispatchHoldCodes = (
  target: Pick<Window, "dispatchEvent">,
  { codes, isPressed }: { codes: readonly string[]; isPressed: boolean },
): void => {
  for (const code of codes) {
    const button = checkIsEnumValue(MouseButton, code) ? MOUSE_BUTTONS.indexOf(code) : -1;
    if (button === -1) target.dispatchEvent(new KeyboardEvent(isPressed ? "keydown" : "keyup", { code }));
    else target.dispatchEvent(new MouseEvent(isPressed ? "mousedown" : "mouseup", { button }));
  }
};
