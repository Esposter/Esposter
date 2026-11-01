import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

// A custom event carrying the values after a change. It does not bubble, and a silent call or instance sends none
export const dispatchPanzoomEvent = (
  element: PanzoomElement,
  name: PanzoomEventName,
  detail: PanzoomEventDetail,
  { silent }: Pick<PanzoomOptions, "silent">,
): void => {
  if (silent) return;

  element.dispatchEvent(new CustomEvent(name, { detail }));
};
