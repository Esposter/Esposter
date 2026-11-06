import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A pan in progress: the viewport's origin at the press, and the screen point the press began on
export interface GesturePanning {
  phase: GesturePhase.Panning;
  pointerId: number;
  screen: Point;
  viewportOrigin: Point;
}
