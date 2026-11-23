import type { SortingClassMember } from "#src/models/oxlint/sorting/SortingClassMember";
import type { ESTree } from "@oxlint/plugins";

// Whether a `this` sits in a field or a static block of a class nested in the member, where it is that class's `this`.
// A computed key or a heritage clause of the nested class runs under the member's own `this`, so it is not one of these
export const checkIsNestedClassThis = (reference: ESTree.Node, member: SortingClassMember): boolean => {
  let child = reference;
  for (let ancestor = reference.parent; ancestor && ancestor !== member.node; ancestor = ancestor.parent) {
    if (
      ancestor.type === "StaticBlock" ||
      ((ancestor.type === "PropertyDefinition" || ancestor.type === "AccessorProperty") && ancestor.value === child)
    )
      return true;
    child = ancestor;
  }
  return false;
};
