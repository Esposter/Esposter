import type { KeyTree } from "#src/models/gameData/KeyTree";

import { descendKeyTree } from "#src/services/gameData/descendKeyTree";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A key that also prefixes other keys sits under `self`, since one node cannot be both a string and a branch; a literal `self` segment is the one collision
export const insertKey = (tree: KeyTree, key: string): void => {
  const segments = key.split("/");
  const leaf = segments.pop() ?? key;
  const parent = segments.reduce((node, segment) => descendKeyTree(node, segment), tree);
  const entry = parent[leaf];
  if (entry === undefined) parent[leaf] = key;
  else if (typeof entry === "string" || entry.self !== undefined)
    throw new InvalidOperationError(Operation.Push, key, "shares its self slot with a segment named self in the lock");
  else entry.self = key;
};
