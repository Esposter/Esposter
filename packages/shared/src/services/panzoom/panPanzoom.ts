import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { constrainPanzoomPan } from "#src/services/panzoom/constrainPanzoomPan";
import { dispatchPanzoomChange } from "#src/services/panzoom/dispatchPanzoomChange";
import { getPanzoomCallOptions } from "#src/services/panzoom/getPanzoomCallOptions";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { writePanzoomState } from "#src/services/panzoom/writePanzoomState";

// Pans to the point the call asks for, held on a disabled axis and contained at the current scale. The pan is sent only when
// X or Y moved, and a call that moves neither returns the values it found
export const panPanzoom = (
  context: PanzoomContext,
  point: PanzoomPoint,
  callOptions: PanzoomZoomOptions,
  originalEvent?: Event,
): PanzoomEventDetail => {
  const options = getPanzoomCallOptions(context, callOptions);
  const { element, parent, state } = context;
  const measure = getPanzoomMeasure(element, parent, state);
  const pan = constrainPanzoomPan(state, point, state.scale, measure, options);
  if (pan.x === state.x && pan.y === state.y) return getPanzoomEventDetail(context, originalEvent);

  writePanzoomState(context, { scale: state.scale, x: pan.x, y: pan.y }, options);
  const detail = getPanzoomEventDetail(context, originalEvent);
  dispatchPanzoomChange(context, PanzoomEventName.Pan, detail, options);

  return detail;
};
