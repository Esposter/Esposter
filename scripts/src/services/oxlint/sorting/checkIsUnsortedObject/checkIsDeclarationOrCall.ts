import type { ESTree } from "@oxlint/plugins";

// The ancestors an object is declared or called within, the nodes a declaration name is read from
export const checkIsDeclarationOrCall = (node: ESTree.Node): boolean =>
  ["VariableDeclarator", "CallExpression", "Property"].includes(node.type);
