import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { dispatchPanzoomChange } from "#src/services/panzoom/dispatchPanzoomChange";
import { getPanzoomCallOptions } from "#src/services/panzoom/getPanzoomCallOptions";
import { getPanzoomEventDetail } from "#src/services/panzoom/getPanzoomEventDetail";
import { getPanzoomMeasure } from "#src/services/panzoom/getPanzoomMeasure";
import { getPanzoomStartState } from "#src/services/panzoom/getPanzoomStartState";
import { reanchorPanzoomDrag } from "#src/services/panzoom/reanchorPanzoomDrag";
import { writePanzoomState } from "#src/services/panzoom/writePanzoomState";

// Restores the start scale and the start pan in one write, animated and forced unless the call says otherwise
export const resetPanzoom = (context: PanzoomContext, callOptions: PanzoomZoomOptions): PanzoomEventDetail => {
  const options = getPanzoomCallOptions(context, { animate: true, force: true, ...callOptions });
  const { element, parent, state } = context;
  const measure = getPanzoomMeasure(element, parent, state);
  writePanzoomState(context, getPanzoomStartState(state, measure, options), options);
  const detail = getPanzoomEventDetail(context);
  dispatchPanzoomChange(context, PanzoomEventName.Reset, detail, options);
  reanchorPanzoomDrag(context);

  return detail;
};
