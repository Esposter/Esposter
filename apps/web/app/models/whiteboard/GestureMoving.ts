import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A drag that moves the selection: each selected element moves by how far the pointer has travelled from the origin
export interface GestureMoving {
  origin: Point;
  phase: GesturePhase.Moving;
  pointerId: number;
}
