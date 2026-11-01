import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import { dispatchPanzoomEvent } from "#src/services/panzoom/dispatchPanzoomEvent";

// A change sends the event for what caused it, and then the change, both with the same detail
export const dispatchPanzoomChange = (
  element: PanzoomElement,
  name: PanzoomEventName,
  detail: PanzoomEventDetail,
  options: Pick<PanzoomOptions, "silent">,
): void => {
  dispatchPanzoomEvent(element, name, detail, options);
  dispatchPanzoomEvent(element, PanzoomEventName.Change, detail, options);
};
