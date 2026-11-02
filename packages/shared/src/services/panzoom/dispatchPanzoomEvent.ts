import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";
import type { PanzoomEventName } from "#src/models/panzoom/PanzoomEventName";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

// A custom event carrying the values after a change. It does not bubble, and a silent call or instance, or a destroyed one,
// Sends none. The destroyed flag is read at each send, so a listener that destroys the panzoom stops the events after it
export const dispatchPanzoomEvent = (
  { element, isDestroyed }: Pick<PanzoomContext, "element" | "isDestroyed">,
  name: PanzoomEventName,
  detail: PanzoomEventDetail,
  { silent }: Pick<PanzoomOptions, "silent">,
): void => {
  if (silent || isDestroyed) return;

  element.dispatchEvent(new CustomEvent(name, { detail }));
};
