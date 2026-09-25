import type { PlayerActions } from "@/models/agentConsole/world/PlayerActions";
import type { Vector2Like } from "three";

import { GamepadButton } from "@/models/agentConsole/world/GamepadButton";
import { GAMEPAD_DEAD_ZONE, SPRINT_DOUBLE_TAP_MS } from "@/services/agentConsole/world/constants";
import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { Vector2 } from "three";

// A gamepad stick's tilt, with the few hundredths a resting stick reads left at zero
const readStick = (gamepad: Gamepad, xAxisIndex: number, out: Vector2) => {
  out.set(gamepad.axes[xAxisIndex] ?? 0, gamepad.axes[xAxisIndex + 1] ?? 0);
  if (out.length() < GAMEPAD_DEAD_ZONE) out.set(0, 0);
};
// The first connected gamepad, read fresh each frame, since the browser hands out a snapshot rather than a live one
const readGamepad = () => window.navigator.getGamepads().find((gamepad): gamepad is Gamepad => Boolean(gamepad));
const checkIsButtonPressed = (gamepad: Gamepad | undefined, gamepadButton: GamepadButton) =>
  Boolean(gamepad?.buttons[gamepadButton]?.pressed);
// The keys, the touch joystick and a gamepad as one direction to walk, one to turn the camera, and Minecraft's jump,
// Sneak and sprint: Space, Shift, and forward pressed twice, or a gamepad's A and its two sticks pressed in. Each is
// Read only while the world has the keys, nothing editable has focus and no browser modifier is held, so typing and a
// Browser's own shortcuts are never taken over. A direction's x is rightward and its y forward, as the camera sees it
export const usePlayerInput = (getJoystickDirection: () => Vector2Like) => {
  const agentConsolePanelStore = useAgentConsolePanelStore();
  const { isWorldActive } = storeToRefs(agentConsolePanelStore);
  // Every key held down, by its lowercased name
  const { current: pressedKeys } = useMagicKeys();
  const activeElement = useActiveElement();
  const isInputActive = computed(
    () =>
      isWorldActive.value &&
      !activeElement.value?.matches("input, textarea, select, [contenteditable]") &&
      !["alt", "control", "meta"].some((key) => pressedKeys.has(key)),
  );
  const stick = new Vector2();
  let isSprintLatched = false;
  let lastForwardPressedAt = 0;
  let wasUsePressed = false;
  // Forward pressed twice in quick succession starts a sprint, as Minecraft's double tap does
  useEventListener("keydown", (event: KeyboardEvent) => {
    if (event.repeat || !isInputActive.value || !["arrowup", "w"].includes(event.key.toLowerCase())) return;
    isSprintLatched ||= event.timeStamp - lastForwardPressedAt < SPRINT_DOUBLE_TAP_MS;
    lastForwardPressedAt = event.timeStamp;
  });
  // Diagonals are cut back to the length of a straight step, so walking at an angle is no faster
  const readMove = (out: Vector2) => {
    out.set(0, 0);
    if (!isInputActive.value) return;
    const joystickDirection = getJoystickDirection();
    out.set(
      Number(pressedKeys.has("d") || pressedKeys.has("arrowright")) -
        Number(pressedKeys.has("a") || pressedKeys.has("arrowleft")) +
        joystickDirection.x,
      Number(pressedKeys.has("w") || pressedKeys.has("arrowup")) -
        Number(pressedKeys.has("s") || pressedKeys.has("arrowdown")) +
        joystickDirection.y,
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
  // A sneak never sprints, and a sprint ends once forward is let go. A focused button keeps Space for pressing it
  const readActions = (move: Vector2, out: PlayerActions) => {
    const gamepad = isInputActive.value ? readGamepad() : undefined;
    out.isSneaking =
      isInputActive.value && (pressedKeys.has("shift") || checkIsButtonPressed(gamepad, GamepadButton.RightStick));
    out.isJumping =
      isInputActive.value &&
      ((pressedKeys.has(" ") && !activeElement.value?.matches("button, a")) ||
        checkIsButtonPressed(gamepad, GamepadButton.A));
    isSprintLatched ||= checkIsButtonPressed(gamepad, GamepadButton.LeftStick);
    isSprintLatched &&= isInputActive.value && move.y > 0 && !out.isSneaking;
    out.isSprinting = isSprintLatched;
  };
  // Whether a gamepad's use trigger went down since the last frame, which uses what is in reach as E does
  const readUse = () => {
    const isUsePressed = isInputActive.value && checkIsButtonPressed(readGamepad(), GamepadButton.LeftTrigger);
    const isUseStarted = isUsePressed && !wasUsePressed;
    wasUsePressed = isUsePressed;
    return isUseStarted;
  };
  return { readActions, readLook, readMove, readUse };
};
