import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { checkIsZoomRefused } from "#src/services/panzoom/checkIsZoomRefused";
import { dispatchPanzoomChange } from "#src/services/panzoom/dispatchPanzoomChange";
import { getPanzoomCallOptions } from "#src/services/panzoom/getPanzoomCallOptions";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { getPanzoomZoomedState } from "#src/services/panzoom/getPanzoomZoomedState";
import { reanchorPanzoomDrag } from "#src/services/panzoom/reanchorPanzoomDrag";
import { writePanzoomState } from "#src/services/panzoom/writePanzoomState";

// Zooms to the scale, about the focal point when the call names one. A disabled zoom returns the values it found, unless forced
export const zoomPanzoom = (
  context: PanzoomContext,
  scale: number,
  callOptions: PanzoomZoomOptions,
  originalEvent?: Event,
): PanzoomEventDetail => {
  const options = getPanzoomCallOptions(context, callOptions);
  if (checkIsZoomRefused(options)) return getPanzoomEventDetail(context, originalEvent);

  const { element, parent, state } = context;
  const measure = getPanzoomMeasure(element, parent, state);
  writePanzoomState(context, getPanzoomZoomedState(state, measure, options, scale, options.focal), options);
  const detail = getPanzoomEventDetail(context, originalEvent);
  dispatchPanzoomChange(context, PanzoomEventName.Zoom, detail, options);
  reanchorPanzoomDrag(context);

  return detail;
};
