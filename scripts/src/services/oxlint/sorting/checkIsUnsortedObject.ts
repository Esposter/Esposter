import type { ESTree, SourceCode } from "@oxlint/plugins";

import { checkIsDeclarationOrCall } from "#src/services/oxlint/sorting/checkIsUnsortedObject/checkIsDeclarationOrCall";
import { computeDeclarationName } from "#src/services/oxlint/sorting/computeDeclarationName";

// Whether an object keeps its written order: one anywhere inside a `defineCommand` call, or one declared as `…Args`.
// A command reads its arguments in declaration order, and an `…Args` object is read the same way.
export const checkIsUnsortedObject = (
  node: ESTree.ObjectExpression | ESTree.ObjectPattern,
  sourceCode: SourceCode,
): boolean => {
  let nearest: ESTree.Node | undefined;
  for (let ancestor: ESTree.Node | undefined = node.parent; ancestor; ancestor = ancestor.parent ?? undefined) {
    if (
      ancestor.type === "CallExpression" &&
      ancestor.callee.type === "Identifier" &&
      ancestor.callee.name === "defineCommand"
    )
      return true;
    if (nearest === undefined && checkIsDeclarationOrCall(ancestor)) nearest = ancestor;
  }
  return (
    (nearest?.type === "VariableDeclarator" || nearest?.type === "Property") &&
    computeDeclarationName(nearest, sourceCode).endsWith("Args")
  );
};
