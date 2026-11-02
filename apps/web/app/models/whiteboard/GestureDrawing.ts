import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "headless-block-editor";

// A freehand stroke in progress: its id is fixed at the press, and its points are the document points the pointer has taken
export interface GestureDrawing {
  elementId: string;
  phase: GesturePhase.Drawing;
  points: Point[];
  pointerId: number;
}
