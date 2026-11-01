import type { PanzoomContext } from "#src/models/panzoom/PanzoomContext";
import type { PanzoomEventDetail } from "#src/models/panzoom/PanzoomEventDetail";

import { PANZOOM_SVG_NAMESPACE } from "#src/services/panzoom/constants";

// The values after a change, with the event that caused it when there is one. An SVG element other than the root svg is SVG
export const getPanzoomEventDetail = (
  { element, state }: PanzoomContext,
  originalEvent?: Event,
): PanzoomEventDetail => ({
  isSVG: element.namespaceURI === PANZOOM_SVG_NAMESPACE && element.localName !== "svg",
  originalEvent,
  scale: state.scale,
  x: state.x,
  y: state.y,
});
