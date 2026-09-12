import type { ESTree } from "@oxlint/plugins";

// The name a function is bound to, when it is bound to one rather than passed straight to a call: a closure holding
// An emit notifies nothing until that name is invoked, so the name is what carries the notify forward.
export const getBoundFunctionName = (node: ESTree.Node): string | undefined => {
  if (node.type === "FunctionDeclaration") return node.id?.name;
  const { parent } = node;
  if (parent?.type === "VariableDeclarator" && parent.init === node && parent.id.type === "Identifier")
    return parent.id.name;
  else if (parent?.type === "AssignmentExpression" && parent.right === node && parent.left.type === "Identifier")
    return parent.left.name;
  return undefined;
};
