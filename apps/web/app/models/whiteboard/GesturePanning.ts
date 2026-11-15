import type { GesturePhase } from "#src/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A pan in progress: the viewport's origin at the press, and the screen point the press began on
export interface GesturePanning {
  phase: typeof GesturePhase.Panning;
  pointerId: number;
  screen: Point;
  viewportOrigin: Point;
}
