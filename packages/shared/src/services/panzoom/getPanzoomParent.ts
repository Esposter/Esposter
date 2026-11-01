import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { isPanzoomElement } from "#src/services/panzoom/isPanzoomElement";

// The element a panzoom is contained in: its parent element, or the host of the shadow root it is a direct child of
export const getPanzoomParent = (element: PanzoomElement): PanzoomElement | null => {
  const { parentNode } = element;
  if (parentNode instanceof ShadowRoot) return isPanzoomElement(parentNode.host) ? parentNode.host : null;

  return element.parentElement;
};
