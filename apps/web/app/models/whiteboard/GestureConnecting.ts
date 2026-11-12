import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A drag from a connection handle of a selected shape: the shape and the connection point its handle sits on, and the ids fixed at the press for the
// Arrow it would draw and the shape it would add. A release on empty canvas adds that shape, and a release on another shape joins it instead. The press's
// Screen point is what the drag start distance is measured from
export interface GestureConnecting {
  arrowId: string;
  connectionIndex: number;
  elementId: string;
  phase: GesturePhase.Connecting;
  pointerId: number;
  screen: Point;
  shapeId: string;
}
