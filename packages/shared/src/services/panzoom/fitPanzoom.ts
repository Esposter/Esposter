import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { constrainPanzoomPan } from "#src/services/panzoom/constrainPanzoomPan";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { dispatchPanzoomChange } from "#src/services/panzoom/dispatchPanzoomChange";
import { getPanzoomCallOptions } from "#src/services/panzoom/getPanzoomCallOptions";
import { getPanzoomCentredPan } from "#src/services/panzoom/getPanzoomCentredPan";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { reanchorPanzoomDrag } from "#src/services/panzoom/reanchorPanzoomDrag";
import { writePanzoomState } from "#src/services/panzoom/writePanzoomState";

// Scales the element to fit its parent's content box and centres it there, as a zoom: forced unless the call says otherwise
export const fitPanzoom = (context: PanzoomContext, callOptions: PanzoomZoomOptions): PanzoomEventDetail => {
  const options = getPanzoomCallOptions(context, { force: true, ...callOptions });
  const { element, parent, state } = context;
  const measure = getPanzoomMeasure(element, parent, state);
  const scale = constrainPanzoomScale(getPanzoomFitScale(measure), measure, options);
  const pan = constrainPanzoomPan(state, getPanzoomCentredPan(scale, measure), scale, measure, {
    ...options,
    relative: false,
  });
  writePanzoomState(context, { scale, x: pan.x, y: pan.y }, options);
  const detail = getPanzoomEventDetail(context);
  dispatchPanzoomChange(element, PanzoomEventName.Zoom, detail, options);
  reanchorPanzoomDrag(context);

  return detail;
};
