import type { PanzoomElement } from "#src/models/panzoom/PanzoomElement";

import { checkIsPanzoomElement } from "#src/services/panzoom/checkIsPanzoomElement";

// A shadow root is told apart by its node type and its host rather than `instanceof`, which is false for a root from
// Another window
const checkIsShadowRoot = (node: Node): node is ShadowRoot =>
  node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in node;

// The element a panzoom is contained in: its parent element, or the host of the shadow root it is a direct child of.
export const getPanzoomParent = (element: PanzoomElement): null | PanzoomElement => {
  const { parentNode } = element;
  if (parentNode && checkIsShadowRoot(parentNode)) {
    const { host } = parentNode;
    return checkIsPanzoomElement(host) ? host : null;
  }

  return element.parentElement;
};
