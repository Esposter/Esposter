import type { KeyTree } from "#src/models/hostedAssets/KeyTree";

import { descendKeyTree } from "#src/services/hostedAssets/descendKeyTree";
import { InvalidOperationError, Operation } from "@esposter/shared";

const shareSelfSlot = (key: string) =>
  new InvalidOperationError(Operation.Push, key, "shares its self slot with a segment named self in the lock");

// A key that also prefixes other keys sits under `self`, since one node cannot be both a string and a branch; a literal `self` segment is the one collision
export const insertKey = (tree: KeyTree, key: string): void => {
  const segments = key.split("/");
  const leaf = segments.pop() ?? key;
  const parent = segments.reduce((node, segment, index) => {
    // A self slot's string is the key of the node that holds it, so a path descends through it only when that key is the path's own
    const entry = node[segment];
    if (segment === "self" && typeof entry === "string" && entry !== segments.slice(0, index + 1).join("/"))
      throw shareSelfSlot(key);
    return descendKeyTree(node, segment);
  }, tree);
  const entry = parent[leaf];
  if (entry === undefined) parent[leaf] = key;
  else if (typeof entry === "string" || entry.self !== undefined) throw shareSelfSlot(key);
  else entry.self = key;
};
