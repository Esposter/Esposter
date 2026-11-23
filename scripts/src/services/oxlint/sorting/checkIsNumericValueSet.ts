import type { ESTree } from "@oxlint/plugins";

import { computeExpressionNumberValue } from "#src/services/oxlint/sorting/computeExpressionNumberValue";

// Whether an object is a constant set of numbers, `const FooMap = { … } as …`, whose members sort by their values
export const checkIsNumericValueSet = (node: ESTree.ObjectExpression): boolean => {
  const { parent } = node;
  if (parent.type !== "TSAsExpression") return false;
  const declarator = parent.parent;
  if (
    declarator.type !== "VariableDeclarator" ||
    declarator.id.type !== "Identifier" ||
    !/^[A-Z][a-z]/u.test(declarator.id.name)
  )
    return false;
  return node.properties.every(
    (property) => property.type !== "Property" || computeExpressionNumberValue(property.value) !== undefined,
  );
};
