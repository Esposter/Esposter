import type { ESTree } from "@oxlint/plugins";

import { defineArrayLiteralRule } from "#src/services/oxlint/sorting/reportArrayLiteral";

// The elements of an array passed as the first argument of `new Set(...)`. A set's order is not what a program reads,
// So Its elements sort even when they run code
const checkIsSetArgument = (node: ESTree.ArrayExpression | ESTree.NewExpression): boolean => {
  const { parent } = node;
  return (
    parent.type === "NewExpression" &&
    parent.callee.type === "Identifier" &&
    parent.callee.name === "Set" &&
    parent.arguments[0] === node
  );
};

export default defineArrayLiteralRule(checkIsSetArgument, false);
