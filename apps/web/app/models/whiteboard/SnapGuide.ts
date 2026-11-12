import type { SnapAxis } from "@/models/whiteboard/SnapAxis";

// A line a move shows where its box lines up with another element. It sits at a position on its axis, in document units, and runs from start to end
// Along the other axis, across the moved box and each element it lines up with
export interface SnapGuide {
  axis: SnapAxis;
  end: number;
  position: number;
  start: number;
}
