import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomPinch } from "#src/models/panzoom/PanzoomPinch";

import { getPanzoomPinchFrame } from "#src/services/panzoom/getPanzoomPinchFrame";
import { getPanzoomPinchScale } from "#src/services/panzoom/getPanzoomPinchScale";
import { panPanzoom } from "#src/services/panzoom/panPanzoom";
import { zoomPanzoom } from "#src/services/panzoom/zoomPanzoom";
import { takeOne } from "#src/util/array/takeOne";

// A pinch zooms to the scale its fingers' distance gives, about the midpoint its last step ended on, so the content there
// Stays put. With pinchAndPan the midpoint's movement pans as well, which keeps the content under the fingers under them
export const movePanzoomPinch = (context: PanzoomContext, pinch: PanzoomPinch, event: PointerEvent): void => {
  const points = [...context.pointers.values()];
  const frame = getPanzoomPinchFrame(takeOne(points, 0), takeOne(points, 1));
  const scale = getPanzoomPinchScale(pinch.startScale, pinch.startDistance, frame.distance);
  zoomPanzoom(context, scale, { animate: false, focal: pinch.midpoint }, event);
  if (context.options.pinchAndPan) {
    const { state } = context;
    panPanzoom(
      context,
      {
        x: state.x + (frame.midpoint.x - pinch.midpoint.x) / state.scale,
        y: state.y + (frame.midpoint.y - pinch.midpoint.y) / state.scale,
      },
      { animate: false, relative: false },
      event,
    );
  }

  pinch.midpoint = frame.midpoint;
};
