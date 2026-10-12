import type { Input, InputAction } from "genshin-engine";

import { getActionKeyCode } from "#src/services/shared/getActionKeyCode";

// A press on a piece that acts once, as a tap of its action's key: the key pressed and let go in the same frame
export const tapActionKey = (input: Input, inputAction: InputAction) => {
  const code = getActionKeyCode(inputAction);
  input.press(code);
  input.release(code);
};
