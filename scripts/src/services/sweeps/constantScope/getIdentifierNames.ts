import type { Node } from "oxc-parser";

import { getDescendants } from "#src/services/sweeps/getDescendants";

export const getIdentifierNames = (node: Node): string[] =>
  getDescendants(node).flatMap((descendant) => (descendant.type === "Identifier" ? [descendant.name] : []));
