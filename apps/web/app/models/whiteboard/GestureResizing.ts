import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point } from "vue-block-editor-headless";

// A drag that resizes one element from the handle the press landed on
export interface GestureResizing {
  elementId: string;
  handle: ResizeHandle;
  origin: Point;
  phase: GesturePhase.Resizing;
  pointerId: number;
}
