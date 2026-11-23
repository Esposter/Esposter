import type { GameObjects } from "phaser";

import { Input } from "phaser";

// Seen only when it and every container holding it are visible: a hidden menu is never clicked outside of
const checkIsVisible = (gameObject: GameObjects.GameObject): boolean => {
  for (
    let current: GameObjects.Container | GameObjects.GameObject | null = gameObject;
    current;
    current = current.parentContainer
  )
    if ("visible" in current && !current.visible) return false;
  return true;
};
// The game object's own hit area through every camera under the pointer, so a zoomed, scrolled or nested object is
// Tested where it is drawn rather than by its bounds
const checkIsPointerOver = (gameObject: GameObjects.GameObject, pointer: Input.Pointer): boolean => {
  const { input } = gameObject.scene;
  return input.cameras
    .getCamerasBelowPointer(pointer)
    .some((camera) => input.manager.hitTest(pointer, [gameObject], camera).length > 0);
};
// A click outside is a press and its release both outside an interactive game object; a press that starts on it is
// Never one, wherever it ends. Each pointer is followed on its own, so a second finger cannot end the first one's click.
// Returns the function that stops listening
export const onClickOutside = (
  gameObject: GameObjects.GameObject,
  listener: (pointer: Input.Pointer) => void,
): (() => void) => {
  const { input } = gameObject.scene;
  const pressedPointers = new Set<Input.Pointer>();
  const checkIsOutside = (pointer: Input.Pointer) =>
    checkIsVisible(gameObject) && !checkIsPointerOver(gameObject, pointer);
  // Every press decides afresh, so a pointer released off the canvas, where no release reaches the scene, cannot carry
  // Its old press into the next click
  const onPointerDown = (pointer: Input.Pointer) => {
    if (checkIsOutside(pointer)) pressedPointers.add(pointer);
    else pressedPointers.delete(pointer);
  };
  const onPointerUp = (pointer: Input.Pointer) => {
    if (pressedPointers.delete(pointer) && checkIsOutside(pointer)) listener(pointer);
  };
  input.on(Input.Events.POINTER_DOWN, onPointerDown);
  input.on(Input.Events.POINTER_UP, onPointerUp);
  return () => {
    input.off(Input.Events.POINTER_DOWN, onPointerDown);
    input.off(Input.Events.POINTER_UP, onPointerUp);
  };
};
