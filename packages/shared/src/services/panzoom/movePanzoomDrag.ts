import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomDrag } from "#src/models/panzoom/PanzoomDrag";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";

import { PANZOOM_DEFAULT_PAN_THRESHOLD } from "#src/services/panzoom/constants";
import { panPanzoom } from "#src/services/panzoom/panPanzoom";

// A drag pans by the pointer's distance from its anchor over the scale, once the pointer has travelled past the threshold
// From the point it went down on. The pan is absolute and not animated, whatever relative means for a call
export const movePanzoomDrag = (
  context: PanzoomContext,
  drag: PanzoomDrag,
  point: PanzoomPoint,
  event: PointerEvent,
): void => {
  const { options, state } = context;
  if (!drag.isDragging) {
    const travel = Math.hypot(point.x - drag.downPoint.x, point.y - drag.downPoint.y);
    if (travel <= (options.panThreshold ?? PANZOOM_DEFAULT_PAN_THRESHOLD)) return;

    drag.isDragging = true;
  }

  panPanzoom(
    context,
    {
      x: drag.anchorPan.x + (point.x - drag.anchorPoint.x) / state.scale,
      y: drag.anchorPan.y + (point.y - drag.anchorPoint.y) / state.scale,
    },
    { animate: false, relative: false },
    event,
  );
};
