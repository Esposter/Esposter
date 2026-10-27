import type { SyntaxNode } from "#src/models/syntax/SyntaxNode";

import { parents } from "#src/services/shared/getParent";
import { checkIsSubjectOfParent } from "#src/services/sweeps/unterminatedResults/checkIsSubjectOfParent";
import { TERMINATOR_NAMES } from "#src/services/sweeps/unterminatedResults/constants";

// The top of the chain the call's value sits in, and whether a terminator is called on it along the way
export const getValueChain = (call: SyntaxNode): { isTerminated: boolean; top: SyntaxNode } => {
  let isTerminated = false;
  let top = call;
  let parent = parents.get(top);
  while (parent && checkIsSubjectOfParent(top)) {
    const grandparent = parents.get(parent);
    if (
      parent.type === "MemberExpression" &&
      !parent.computed &&
      parent.property.type === "Identifier" &&
      TERMINATOR_NAMES.has(parent.property.name) &&
      grandparent?.type === "CallExpression" &&
      grandparent.callee === parent
    )
      isTerminated = true;
    top = parent;
    parent = parents.get(top);
  }
  return { isTerminated, top };
};
