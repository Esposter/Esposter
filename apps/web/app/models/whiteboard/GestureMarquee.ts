import type { GesturePhase } from "#src/models/whiteboard/GesturePhase";
import type { Point } from "vue-block-editor-headless";

// A marquee in progress: the selection it began with, which it adds to under shift, and the two corners it spans
export interface GestureMarquee {
  baseIds: string[];
  current: Point;
  origin: Point;
  phase: typeof GesturePhase.Marquee;
  pointerId: number;
}
