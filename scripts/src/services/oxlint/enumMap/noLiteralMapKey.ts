import type { ESTree, Rule } from "@oxlint/plugins";

import { MESSAGE } from "#src/services/oxlint/enumMap/constants";
import { defineRule } from "@oxlint/plugins";

// A constant map is a PascalCase `…Map`, the name a lookup table gets when it is a module's own constant
const MAP_NAME = /^[A-Z]\w*Map$/u;

// `Record<string, …>` is an open set of keys, which no enum can name, so the map over it keeps its literal keys. A
// `Partial`, `Readonly` or `Required` around it leaves the set open, so it is read through
const OPEN_SET_WRAPPERS = new Set(["Partial", "Readonly", "Required"]);
const checkIsOpenSet = (type: ESTree.TSType | undefined): boolean => {
  if (type?.type !== "TSTypeReference" || type.typeName.type !== "Identifier") return false;
  const [parameter] = type.typeArguments?.params ?? [];
  if (type.typeName.name === "Record") return parameter?.type === "TSStringKeyword";
  return OPEN_SET_WRAPPERS.has(type.typeName.name) && checkIsOpenSet(parameter);
};

const checkIsNumericKey = (key: ESTree.PropertyKey): boolean => key.type === "Literal" && typeof key.value === "number";

export const noLiteralMapKey: Rule = defineRule({
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier" || !MAP_NAME.test(node.id.name) || !node.init) return;

        // Walk down through `as const`, `as` and `satisfies` to the object literal, noting whether an `as` or a
        // `satisfies` makes the set of keys open. oxlint's AST has no parenthesis node, so there is none to walk
        let isOpenSet = checkIsOpenSet(node.id.typeAnnotation?.typeAnnotation);
        let expression: ESTree.Expression = node.init;
        while (expression.type === "TSAsExpression" || expression.type === "TSSatisfiesExpression") {
          if (
            (expression.type === "TSAsExpression" || expression.type === "TSSatisfiesExpression") &&
            checkIsOpenSet(expression.typeAnnotation)
          )
            isOpenSet = true;
          expression = expression.expression;
        }
        if (expression.type !== "ObjectExpression" || isOpenSet) return;

        // A numeric key is a dataset's id, which no enum can name, so a map keyed by ids keeps them
        for (const property of expression.properties)
          if (property.type === "Property" && !property.computed && !checkIsNumericKey(property.key))
            context.report({ message: MESSAGE, node: property.key });
      },
    };
  },
  meta: { type: "suggestion" },
});
