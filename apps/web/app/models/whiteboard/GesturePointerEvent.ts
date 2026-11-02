import type { GesturePointerAction } from "@/models/whiteboard/GesturePointerAction";
import type { Point } from "headless-block-editor";

// A pointer event as the gesture reads it: its action, the button and shift state it carries, and its point in screen pixels
export interface GesturePointerEvent {
  action: GesturePointerAction;
  button: number;
  isShiftKey: boolean;
  pointerId: number;
  screen: Point;
}
