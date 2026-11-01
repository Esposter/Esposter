import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomZoomDirection } from "#src/models/panzoom/PanzoomZoomDirection";
import type { PanzoomZoomOptions } from "#src/models/panzoom/PanzoomZoomOptions";

import { getPanzoomStepScale } from "#src/services/panzoom/getPanzoomStepScale";
import { zoomPanzoom } from "#src/services/panzoom/zoomPanzoom";

// A zoom one step in or out from the current scale, animated unless the call says otherwise
export const zoomPanzoomStep = (
  context: PanzoomContext,
  direction: PanzoomZoomDirection,
  zoomOptions: PanzoomZoomOptions,
): PanzoomEventDetail =>
  zoomPanzoom(context, getPanzoomStepScale(context.state.scale, direction, context.options.step), {
    animate: true,
    ...zoomOptions,
  });
