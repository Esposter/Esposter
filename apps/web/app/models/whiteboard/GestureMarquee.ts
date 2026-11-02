import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { Point } from "headless-block-editor";

// A marquee in progress: the selection it began with, which it adds to under shift, and the two corners it spans
export interface GestureMarquee {
  baseIds: string[];
  current: Point;
  origin: Point;
  phase: GesturePhase.Marquee;
  pointerId: number;
}
