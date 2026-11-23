import type { ESTree } from "@oxlint/plugins";

// Whether a class property holds a function, whose body runs only when the function is called
export const checkIsFunctionProperty = (element: ESTree.ClassElement): boolean =>
  (element.type === "AccessorProperty" || element.type === "PropertyDefinition") &&
  (element.value?.type === "ArrowFunctionExpression" || element.value?.type === "FunctionExpression");
