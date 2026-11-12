import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A drag that moves the selection: each selected element moves by how far the pointer has travelled from the origin. An Alt drag moves copies of
// The selection instead, each copy under the id its original maps to, and the originals stay where they are
export interface GestureMoving {
  origin: Point;
  // The copy id of each original of an Alt drag, fixed at the press, which the copies are inserted under when the drag starts
  originalIdCopyIdMap?: Record<string, string>;
  phase: GesturePhase.Moving;
  pointerId: number;
}
