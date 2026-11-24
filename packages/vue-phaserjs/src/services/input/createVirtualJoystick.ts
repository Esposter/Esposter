import type { VirtualJoystick } from "#src/models/input/VirtualJoystick";
import type { GameObjects, Scene } from "phaser";

import { NotInitializedError } from "@esposter/shared";
import { Input, Math as PhaserMath } from "phaser";

interface VirtualJoystickOptions {
  base: GameObjects.Components.Transform;
  // How far the thumb moves from the centre before a direction is pressed, so a resting finger presses nothing
  deadZone: number;
  radius: number;
  thumb: GameObjects.Components.Transform;
}
// A thumb held within the radius of its base is read as one of four arrow keys, as a directional pad would be.
// The axis the thumb is further along wins, so a diagonal never presses two.
// One pointer holds it at a time, and every other pointer stays free for the buttons.
// Positions are compared in the camera's world, so a zoomed or scrolled camera is read where it is drawn.
// So is a scaled base image.
export const createVirtualJoystick = (
  scene: Scene,
  { base, deadZone, radius, thumb }: VirtualJoystickOptions,
): VirtualJoystick => {
  const { input } = scene;
  const { keyboard } = input;
  if (!keyboard) throw new NotInitializedError("Keyboard plugin");

  const createKey = (keyCode: number) => new Input.Keyboard.Key(keyboard, keyCode);
  const cursorKeys: VirtualJoystick["cursorKeys"] = {
    down: createKey(Input.Keyboard.KeyCodes.DOWN),
    left: createKey(Input.Keyboard.KeyCodes.LEFT),
    right: createKey(Input.Keyboard.KeyCodes.RIGHT),
    up: createKey(Input.Keyboard.KeyCodes.UP),
  };
  const keys = Object.values(cursorKeys);
  let heldPointer: Input.Pointer | undefined;

  // One vector the camera writes each pointer's world point into, read once per event
  const worldPoint = new PhaserMath.Vector2();
  const getOffset = (pointer: Input.Pointer) => {
    scene.cameras.main.getWorldPoint(pointer.x, pointer.y, worldPoint);
    const x = worldPoint.x - base.x;
    const y = worldPoint.y - base.y;
    return { distance: Math.hypot(x, y), x, y };
  };
  // A real keyboard event, so each key keeps the time it went down and how long it was held as the keyboard's would
  const pressKey = (pressedKey: Input.Keyboard.Key | undefined) => {
    for (const key of keys) {
      const isDown = key === pressedKey;
      if (key.isDown === isDown) continue;
      else if (isDown) key.onDown(new window.KeyboardEvent("keydown"));
      else key.onUp(new window.KeyboardEvent("keyup"));
    }
  };
  const update = ({ distance, x, y }: ReturnType<typeof getOffset>) => {
    const scale = distance > radius ? radius / distance : 1;
    thumb.setPosition(base.x + x * scale, base.y + y * scale);
    if (distance < deadZone) pressKey(undefined);
    else if (Math.abs(x) >= Math.abs(y)) pressKey(x < 0 ? cursorKeys.left : cursorKeys.right);
    else pressKey(y < 0 ? cursorKeys.up : cursorKeys.down);
  };
  const hold = (pointer: Input.Pointer) => {
    if (heldPointer) return;
    const offset = getOffset(pointer);
    if (offset.distance > radius) return;
    heldPointer = pointer;
    update(offset);
  };
  const release = () => {
    heldPointer = undefined;
    thumb.setPosition(base.x, base.y);
    pressKey(undefined);
  };

  // A finger pressed elsewhere and slid onto the joystick takes it as a press on it would
  const onPointerMove = (pointer: Input.Pointer) => {
    if (pointer === heldPointer) update(getOffset(pointer));
    else if (pointer.isDown) hold(pointer);
  };
  // A release off the canvas reaches the scene as its own event, and the joystick lets go for either
  const onPointerUp = (pointer: Input.Pointer) => {
    if (pointer === heldPointer) release();
  };

  thumb.setPosition(base.x, base.y);
  input.on(Input.Events.POINTER_DOWN, hold);
  input.on(Input.Events.POINTER_MOVE, onPointerMove);
  input.on(Input.Events.POINTER_UP, onPointerUp);
  input.on(Input.Events.POINTER_UP_OUTSIDE, onPointerUp);
  return {
    cursorKeys,
    destroy: () => {
      input.off(Input.Events.POINTER_DOWN, hold);
      input.off(Input.Events.POINTER_MOVE, onPointerMove);
      input.off(Input.Events.POINTER_UP, onPointerUp);
      input.off(Input.Events.POINTER_UP_OUTSIDE, onPointerUp);
      release();
    },
  };
};
