import type { ESTree } from "@oxlint/plugins";

import { SPREAD_MARKER } from "#src/services/oxlint/passThroughHelper/constants";

// The name a parameter binds, or undefined for a pattern/default — both mean the wrapper is doing more than
// Forwarding, so an undefined here stops the check rather than failing it. A rest parameter keeps its `...`,
// So it only ever matches an argument spread back out: `(...a) => f(a)` hands the callee an array the caller
// Never wrote, and `(a) => f(...a)` the reverse.
export const getParameterName = (parameter: ESTree.Node): string | undefined => {
  if (parameter.type === "Identifier") return parameter.name;
  else if (parameter.type === "RestElement" && parameter.argument.type === "Identifier")
    return `${SPREAD_MARKER}${parameter.argument.name}`;
  else return undefined;
};
