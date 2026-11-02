import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/parents";
import { getDescendants } from "#src/services/sweeps/getDescendants";
import { getValueChain } from "#src/services/sweeps/unterminatedResults/getValueChain";

// Whether a later read of the binding answers for its value: a chain begun on it that a terminator ends, or one whose
// Value leaves the statement for its caller to end, through a `return`, a callback's body, or an argument, array
// Element or object property of a call, `new`, array or object. A value bound to a new name is not followed, so it
// Does not count. A longer property name, or another object's field spelled the same, is not the binding, so only
// The identifier itself is read
export const checkIsBindingTerminated = (call: SyntaxNode, bindingName: string, scope: SyntaxNode): boolean =>
  getDescendants(scope).some((node) => {
    if (node.type !== "MemberExpression" || node.computed || node.start < call.end) return false;
    if (node.object.type !== "Identifier" || node.object.name !== bindingName) return false;
    const { isTerminated, top } = getValueChain(node.object);
    const parent = parents.get(top);
    const isHandedOff =
      parent?.type === "ReturnStatement" ||
      (parent?.type === "ArrowFunctionExpression" && parent.body === top) ||
      ((parent?.type === "CallExpression" || parent?.type === "NewExpression") &&
        parent.arguments.some((argument) => argument === top)) ||
      (parent?.type === "ArrayExpression" && parent.elements.some((element) => element === top)) ||
      (parent?.type === "Property" && parent.value === top && parents.get(parent)?.type === "ObjectExpression");
    return isTerminated || isHandedOff;
  });
