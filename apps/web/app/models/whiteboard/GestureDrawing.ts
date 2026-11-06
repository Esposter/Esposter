import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A freehand stroke in progress: its id is fixed at the press, and its points are the document points the pointer has taken
export interface GestureDrawing {
  elementId: string;
  phase: GesturePhase.Drawing;
  pointerId: number;
  points: Point[];
}
