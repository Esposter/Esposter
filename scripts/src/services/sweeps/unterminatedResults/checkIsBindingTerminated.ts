import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/getParent";
import { getDescendants } from "#src/services/sweeps/getDescendants";
import { TERMINATOR_NAMES } from "#src/services/sweeps/unterminatedResults/constants";

// Whether a `binding.match(…)`-style terminator is called on the binding after the call. A longer property name, or
// Another object's field spelled the same, is not the binding, so only the identifier itself is read
export const checkIsBindingTerminated = (call: SyntaxNode, bindingName: string, scope: SyntaxNode): boolean =>
  getDescendants(scope).some((node) => {
    if (node.type !== "MemberExpression" || node.computed || node.start < call.end) return false;
    const parent = parents.get(node);
    return (
      node.object.type === "Identifier" &&
      node.object.name === bindingName &&
      node.property.type === "Identifier" &&
      TERMINATOR_NAMES.has(node.property.name) &&
      parent?.type === "CallExpression" &&
      parent.callee === node
    );
  });
