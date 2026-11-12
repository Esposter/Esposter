import type { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import type { Point } from "vue-block-editor-headless";

// A pointer event as the gesture reads it: its action, the button and the modifier keys it carries, and its point in screen pixels
export interface GesturePointerEvent {
  action: GesturePointerAction;
  button: number;
  isAltKey: boolean;
  isShiftKey: boolean;
  pointerId: number;
  screen: Point;
}
