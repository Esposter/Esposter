import type { ESTree } from "@oxlint/plugins";

import { SPREAD_MARKER } from "#src/services/oxlint/passThroughHelper/constants";

// The name an argument forwards, or undefined for anything the caller did not simply hand over.
export const getArgumentName = (argument: ESTree.Node): string | undefined => {
  if (argument.type === "Identifier") return argument.name;
  else if (argument.type === "SpreadElement" && argument.argument.type === "Identifier")
    return `${SPREAD_MARKER}${argument.argument.name}`;
  else return undefined;
};
