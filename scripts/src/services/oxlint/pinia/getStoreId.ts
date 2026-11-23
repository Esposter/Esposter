import type { ESTree } from "@oxlint/plugins";

// The id a `defineStore` call is given as its first argument, when that argument is a string literal
export const getStoreId = (node: ESTree.CallExpression): string | undefined => {
  const [firstArgument] = node.arguments;
  return firstArgument?.type === "Literal" && typeof firstArgument.value === "string" ? firstArgument.value : undefined;
};
