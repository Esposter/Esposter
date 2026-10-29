import type { KeyTree } from "#src/models/gameData/KeyTree";

import { createKeyTreeNode } from "#src/services/gameData/createKeyTreeNode";

// The node a segment leads to, made if it is not there yet
export const descendKeyTree = (node: KeyTree, segment: string): KeyTree => {
  const entry = node[segment];
  if (entry !== undefined && typeof entry !== "string") return entry;
  const child = createKeyTreeNode();
  if (typeof entry === "string") child.self = entry;
  node[segment] = child;
  return child;
};
