import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { WhiteboardPlacement } from "@/models/whiteboard/WhiteboardPlacement";
import type { Point } from "vue-block-editor-headless";

// An element a placing tool is placing: its id is fixed at the press, and its origin is the press's document point. The press's screen point
// Is what the drag start distance is measured from
export interface GesturePlacing {
  elementId: string;
  origin: Point;
  phase: GesturePhase.Placing;
  placement: WhiteboardPlacement;
  pointerId: number;
  screen: Point;
}
