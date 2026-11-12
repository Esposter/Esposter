import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ResizeHandle } from "@/models/whiteboard/ResizeHandle";
import type { Point } from "vue-block-editor-headless";

// A press that is not yet a gesture: released as a click, or a drag once it has travelled the drag start distance
export interface GesturePressed {
  // The element the press landed on, or "" for the canvas and for a handle
  elementId: string;
  // The handle of the selection the press landed on, or undefined when it landed on no handle
  handle?: ResizeHandle;
  // Whether shift was held, so the press adds to the selection rather than replacing it
  isAdditive: boolean;
  // The press's document point, which a move or a resize is measured from
  origin: Point;
  // The copy id of each element the press selects, when Alt was held on an element: a drag that starts from it copies the selection instead
  originalIdCopyIdMap?: Record<string, string>;
  phase: GesturePhase.Pressed;
  pointerId: number;
  // The press's screen point, which the drag start distance is measured from
  screen: Point;
}
