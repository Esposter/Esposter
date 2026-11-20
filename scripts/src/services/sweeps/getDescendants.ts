import type { Node } from "oxc-parser";

import { getChildren } from "#src/services/shared/getChildren";

// The node and every node beneath it, in source order, so a caller reads a whole subtree with one filter
export const getDescendants = (node: Node): Node[] => [
  node,
  ...getChildren(node).flatMap((child) => getDescendants(child)),
];
