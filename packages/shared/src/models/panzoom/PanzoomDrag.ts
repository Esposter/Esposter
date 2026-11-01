import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

// The one pointer that pans: where it went down, the pointer and the pan a move is measured from, and whether it has passed the threshold
export interface PanzoomDrag {
  anchorPan: PanzoomPoint;
  anchorPoint: PanzoomPoint;
  downPoint: PanzoomPoint;
  isDragging: boolean;
}
