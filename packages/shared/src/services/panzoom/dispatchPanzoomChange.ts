import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { dispatchPanzoomEvent } from "#src/services/panzoom/dispatchPanzoomEvent";

// A change sends the event for what caused it, and then the change, both with the same detail
export const dispatchPanzoomChange = (
  context: Pick<PanzoomContext, "element" | "isDestroyed">,
  name: PanzoomEventName,
  detail: PanzoomEventDetail,
  options: Pick<PanzoomOptions, "silent">,
): void => {
  dispatchPanzoomEvent(context, name, detail, options);
  dispatchPanzoomEvent(context, PanzoomEventName.Change, detail, options);
};
