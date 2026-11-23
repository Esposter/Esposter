import type { Slider } from "#src/models/input/Slider";
import type { GameObjects, Input as PhaserInput, Types } from "phaser";

import { Input } from "phaser";

interface SliderOptions {
  end: Types.Math.Vector2Like;
  // Called with the new value only when a drag changes it, never for a value set through the slider
  onValueChange: (value: number) => void;
  start: Types.Math.Vector2Like;
  value: number;
}
const clampValue = (newValue: number) => Math.min(Math.max(newValue, 0), 1);
// A thumb dragged along the segment from start to end: the drag is projected onto the segment, so the slider runs in
// Any direction, start to end, whichever way the segment points
export const createSlider = (
  thumb: GameObjects.Components.Transform & GameObjects.GameObject,
  { end, onValueChange, start, value }: SliderOptions,
): Slider => {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;
  let currentValue = clampValue(value);
  const moveThumb = () => {
    thumb.setPosition(start.x + segmentX * currentValue, start.y + segmentY * currentValue);
  };
  const setValue = (newValue: number) => {
    const clampedValue = clampValue(newValue);
    if (clampedValue === currentValue) return false;
    currentValue = clampedValue;
    moveThumb();
    return true;
  };
  const onDrag = (_pointer: PhaserInput.Pointer, dragX: number, dragY: number) => {
    // A segment with no length has no direction to project a drag onto, so a drag leaves the value where it is
    if (segmentLengthSquared === 0) return;
    if (setValue(((dragX - start.x) * segmentX + (dragY - start.y) * segmentY) / segmentLengthSquared))
      onValueChange(currentValue);
  };

  moveThumb();
  thumb.setInteractive();
  thumb.scene.input.setDraggable(thumb);
  thumb.on(Input.Events.GAMEOBJECT_DRAG, onDrag);
  return {
    destroy: () => {
      thumb.off(Input.Events.GAMEOBJECT_DRAG, onDrag);
    },
    get value() {
      return currentValue;
    },
    set value(newValue) {
      setValue(newValue);
    },
  };
};
