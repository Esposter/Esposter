import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ArrowEndKey, Point } from "vue-block-editor-headless";

// A drag of one free end of a selected arrow. The end is moved with the pointer and bound where it is released on a shape. The press's screen point
// Is what the drag start distance is measured from
export interface GestureEnd {
  arrowId: string;
  endKey: ArrowEndKey;
  origin: Point;
  phase: GesturePhase.End;
  pointerId: number;
  screen: Point;
}
