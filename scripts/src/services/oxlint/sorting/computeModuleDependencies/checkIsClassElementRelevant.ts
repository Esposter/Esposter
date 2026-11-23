import type { ClassElement } from "#src/models/oxlint/sorting/ClassElement";
import type { ESTree } from "@oxlint/plugins";

import { checkIsFunctionProperty } from "#src/services/oxlint/sorting/checkIsFunctionProperty";
import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";
import { checkHoldsStaticState } from "#src/services/oxlint/sorting/computeModuleDependencies/checkHoldsStaticState";

// Whether a read inside a class element runs at definition: a property's value does, unless it is a function.
// A method or function body runs later, except a read in its key, or in a static method of a class with static state.
export const checkIsClassElementRelevant = (element: ClassElement, identifier: ESTree.Node): boolean => {
  if (element.type !== "MethodDefinition" && !checkIsFunctionProperty(element)) return true;
  if (checkIsRangeContaining(element.key.range, identifier.range)) return true;
  return (
    element.static &&
    element.parent.type === "ClassBody" &&
    element.parent.body.some((member) => checkHoldsStaticState(member))
  );
};
