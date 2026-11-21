import type { InputTarget } from "genshin-engine";

import { FIELD_SELECTOR } from "genshin-engine";

// The window as the engine's input reads it: its listeners, its pointer lock, its gamepads, and the fields a key is typed
// Into, which the browser's own selector names
export const createWindowInputTarget = (target: Window): InputTarget => ({
  addEventListener: target.addEventListener.bind(target),
  checkIsFieldTarget: (eventTarget) => eventTarget instanceof Element && eventTarget.matches(FIELD_SELECTOR),
  checkIsPointerLocked: () => target.document.pointerLockElement !== null,
  getGamepads: () => target.navigator.getGamepads(),
});
