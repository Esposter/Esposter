import type { ESTree } from "@oxlint/plugins";

import { defineArrayLiteralRule } from "#src/services/oxlint/sorting/reportArrayLiteral";

// The elements of an array whose `includes` is called, so a lookup list reads in order. An element that runs code keeps
// Its place, since the array evaluates its elements in the order the source gives them
const checkIsIncludesReceiver = (node: ESTree.ArrayExpression | ESTree.NewExpression): boolean => {
  const { parent } = node;
  if (
    parent.type !== "MemberExpression" ||
    parent.property.type !== "Identifier" ||
    parent.property.name !== "includes"
  )
    return false;
  return parent.parent.type === "CallExpression" && parent.parent.callee === parent;
};

export default defineArrayLiteralRule(checkIsIncludesReceiver, true);
