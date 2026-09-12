import type { ESTree } from "@oxlint/plugins";

// The name a parameter binds, or undefined for a pattern/default — both mean the wrapper is doing more than
// Forwarding, so an undefined here stops the check rather than failing it.
export const getParameterName = (parameter: ESTree.Node): string | undefined => {
  if (parameter.type === "Identifier") return parameter.name;
  else if (parameter.type === "RestElement" && parameter.argument.type === "Identifier") return parameter.argument.name;
  else return undefined;
};
