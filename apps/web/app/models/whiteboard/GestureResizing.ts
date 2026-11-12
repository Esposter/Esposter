import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point } from "vue-block-editor-headless";

// A drag that resizes the selection from the handle the press landed on: one selected element is stretched, and several are scaled together
export interface GestureResizing {
  handle: ResizeHandle;
  origin: Point;
  phase: GesturePhase.Resizing;
  pointerId: number;
}
