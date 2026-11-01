import type { PanzoomDrag } from "#src/models/panzoom/PanzoomDrag";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

// A drag begins where its pointer went down, with the pan the element has at that moment
export const getPanzoomDrag = (state: PanzoomState, point: PanzoomPoint): PanzoomDrag => ({
  anchorPan: { x: state.x, y: state.y },
  anchorPoint: point,
  downPoint: point,
  isDragging: false,
});
