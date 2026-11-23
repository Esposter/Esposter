import type { Input } from "genshin-engine";

import { pressCapturedPointer } from "#src/services/hud/pressCapturedPointer";

// The listeners of a button holding an input's key while it is focused or pressed: Enter or Space holds the key,
// Stopped Before the world's own keys hear them, and a press captures its pointer
export const getHeldKeyListeners = (input: Input, code: string) => {
  const holdOnKey = (isHeld: boolean) => (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.stopPropagation();
    if (isHeld) input.press(code);
    else input.release(code);
  };
  return {
    blur: () => {
      input.release(code);
    },
    keydown: holdOnKey(true),
    keyup: holdOnKey(false),
    lostpointercapture: () => {
      input.release(code);
    },
    pointerdown: (event: PointerEvent) => {
      pressCapturedPointer(input, code, event);
    },
  };
};
