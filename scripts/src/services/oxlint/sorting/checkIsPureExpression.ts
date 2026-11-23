import type { ESTree } from "@oxlint/plugins";

import { checkHasPureMembers } from "#src/services/oxlint/sorting/checkIsPureExpression/checkHasPureMembers";

// Whether evaluating an expression runs no code of its own. A call, `new`, an assignment or update, an `await`, a
// `yield`, a tagged template, a `delete` and an `import()` can run code; every other form is pure when its parts are.
// A function body runs only when called, so a function is pure whatever it holds
export const checkIsPureExpression = (node: ESTree.Node): boolean => {
  switch (node.type) {
    case "ArrayExpression":
      return node.elements.every((element) => element === null || checkIsPureExpression(element));
    case "ArrowFunctionExpression":
    case "FunctionExpression":
    case "Identifier":
    case "Literal":
    case "ThisExpression":
      return true;
    case "BinaryExpression":
    case "LogicalExpression":
      return checkIsPureExpression(node.left) && checkIsPureExpression(node.right);
    case "ClassExpression":
      return checkHasPureMembers(node, checkIsPureExpression);
    case "ConditionalExpression":
      return (
        checkIsPureExpression(node.test) &&
        checkIsPureExpression(node.consequent) &&
        checkIsPureExpression(node.alternate)
      );
    case "MemberExpression":
      return !node.computed && checkIsPureExpression(node.object);
    case "ObjectExpression":
      return node.properties.every((property) =>
        property.type === "SpreadElement"
          ? checkIsPureExpression(property.argument)
          : (!property.computed || checkIsPureExpression(property.key)) && checkIsPureExpression(property.value),
      );
    case "SpreadElement":
      return checkIsPureExpression(node.argument);
    case "TemplateLiteral":
      return node.expressions.every((expression) => checkIsPureExpression(expression));
    case "TSAsExpression":
    case "TSNonNullExpression":
    case "TSSatisfiesExpression":
      return checkIsPureExpression(node.expression);
    case "UnaryExpression":
      return node.operator !== "delete" && checkIsPureExpression(node.argument);
    default:
      return false;
  }
};
