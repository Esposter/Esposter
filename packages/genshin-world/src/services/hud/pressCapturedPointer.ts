import type { Input } from "genshin-engine";

// A press on a button holding a key captures its pointer, so a release outside the button still lets go of the key as
// The capture ends
export const pressCapturedPointer = (input: Input, code: string, event: PointerEvent) => {
  if (event.currentTarget instanceof Element) event.currentTarget.setPointerCapture(event.pointerId);
  input.press(code);
};
