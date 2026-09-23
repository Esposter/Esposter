import type { Vector2Like } from "three";

import { GAMEPAD_DEAD_ZONE } from "@/services/agentConsole/world/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { Vector2 } from "three";
// A gamepad stick's tilt, with the few hundredths a resting stick reads left at zero
const readStick = (gamepad: Gamepad, xAxisIndex: number, out: Vector2) => {
  out.set(gamepad.axes[xAxisIndex] ?? 0, gamepad.axes[xAxisIndex + 1] ?? 0);
  if (out.length() < GAMEPAD_DEAD_ZONE) out.set(0, 0);
};
// The first connected gamepad, read fresh each frame, since the browser hands out a snapshot rather than a live one
const readGamepad = () => window.navigator.getGamepads().find((gamepad): gamepad is Gamepad => Boolean(gamepad));
// The keys, the touch joystick and a gamepad as one direction to walk and one to turn the camera. Each is read only
// While the world has the keys, nothing editable has focus and no modifier is held, so typing and a browser's own
// Shortcuts are never taken over. A direction's x is rightward and its y forward, as the camera sees them
export const usePlayerInput = (joystickDirection: Ref<Vector2Like>) => {
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { isWorldActive } = storeToRefs(agentConsolePanelStore);
  // Every key held down, by its lowercased name
  const { current: pressedKeys } = useMagicKeys();
  const activeElement = useActiveElement();
  const isInputActive = computed(
    () =>
      isWorldActive.value &&
      !activeElement.value?.matches("input, textarea, select, [contenteditable]") &&
      !["alt", "control", "meta", "shift"].some((key) => pressedKeys.has(key)),
  );
  const stick = new Vector2();
  // Diagonals are cut back to the length of a straight step, so walking at an angle is no faster
  const readMove = (out: Vector2) => {
    out.set(0, 0);
    if (!isInputActive.value) return;
    out.set(
      Number(pressedKeys.has("d") || pressedKeys.has("arrowright")) -
        Number(pressedKeys.has("a") || pressedKeys.has("arrowleft")) +
        joystickDirection.value.x,
      Number(pressedKeys.has("w") || pressedKeys.has("arrowup")) -
        Number(pressedKeys.has("s") || pressedKeys.has("arrowdown")) +
        joystickDirection.value.y,
    );
    const gamepad = readGamepad();
    if (gamepad) {
      readStick(gamepad, 0, stick);
      // A stick reads forward as negative
      out.x += stick.x;
      out.y -= stick.y;
    }
    if (out.length() > 1) out.normalize();
  };
  const readLook = (out: Vector2) => {
    out.set(0, 0);
    const gamepad = readGamepad();
    if (isInputActive.value && gamepad) readStick(gamepad, 2, out);
  };
  return { readLook, readMove };
};
