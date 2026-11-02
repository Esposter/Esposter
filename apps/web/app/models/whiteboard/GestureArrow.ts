import type { GesturePhase } from "@/models/whiteboard/GesturePhase";
import type { ArrowEnd, Point } from "headless-block-editor";

// An arrow drawn by a press and a drag: its id is fixed at the press, and its start is the end the press took, bound to the connection point
// Of the shape it landed on or free where it landed. The press's screen point is what the drag start distance is measured from
export interface GestureArrow {
  elementId: string;
  phase: GesturePhase.Arrow;
  pointerId: number;
  screen: Point;
  start: ArrowEnd;
}
