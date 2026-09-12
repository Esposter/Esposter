import type { ESTree } from "@oxlint/plugins";

// The name an argument forwards, or undefined for anything the caller did not simply hand over.
export const getArgumentName = (argument: ESTree.Node): string | undefined => {
  if (argument.type === "Identifier") return argument.name;
  else if (argument.type === "SpreadElement" && argument.argument.type === "Identifier") return argument.argument.name;
  else return undefined;
};
