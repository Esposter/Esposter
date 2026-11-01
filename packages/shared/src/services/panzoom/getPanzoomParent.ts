import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { isPanzoomElement } from "#src/services/panzoom/isPanzoomElement";

// The element a panzoom is contained in: its parent element, or the host of the shadow root it is a direct child of.
// A shadow root is told apart by its node type and its host rather than `instanceof`, which is false for a root from another window
export const getPanzoomParent = (element: PanzoomElement): null | PanzoomElement => {
  const { parentNode } = element;
  if (parentNode?.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in parentNode) {
    const { host } = parentNode as ShadowRoot;
    return isPanzoomElement(host) ? host : null;
  }

  return element.parentElement;
};
