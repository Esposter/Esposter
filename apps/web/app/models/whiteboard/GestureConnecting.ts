import type { GesturePhase } from "#src/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A drag from a connection handle of a selected shape: the shape and the connection point its handle sits on, and the
// Ids fixed at the press for the arrow it would draw and the shape it would add. A release on empty canvas adds that
// Shape, and a release on another shape joins it instead. The press's screen point is what the drag start distance is
// Measured from
export interface GestureConnecting {
  arrowId: string;
  connectionIndex: number;
  elementId: string;
  phase: typeof GesturePhase.Connecting;
  pointerId: number;
  screen: Point;
  shapeId: string;
}
