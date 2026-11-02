import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point } from "headless-block-editor";

// A press that is not yet a gesture: released as a click, or a drag once it has travelled the drag start distance
export interface GesturePressed {
  // The element the press landed on, or "" for the canvas
  elementId: string;
  // The handle of the one selected element the press landed on, or undefined when it landed on no handle
  handle?: ResizeHandle;
  // Whether shift was held, so the press adds to the selection rather than replacing it
  isAdditive: boolean;
  // The press's document point, which a move or a resize is measured from
  origin: Point;
  phase: GesturePhase.Pressed;
  pointerId: number;
  // The press's screen point, which the drag start distance is measured from
  screen: Point;
}
