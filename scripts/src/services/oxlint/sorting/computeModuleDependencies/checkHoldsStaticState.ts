import type { ESTree } from "@oxlint/plugins";

import { checkIsFunctionProperty } from "#src/services/oxlint/sorting/checkIsFunctionProperty";

// Whether a class element holds static state, whose reads run when the class is defined
export const checkHoldsStaticState = (element: ESTree.ClassElement): boolean =>
  element.type === "StaticBlock" ||
  ((element.type === "PropertyDefinition" || element.type === "AccessorProperty") &&
    element.static &&
    !checkIsFunctionProperty(element));
