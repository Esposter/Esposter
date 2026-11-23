import type { KeyTree } from "#src/models/hostedAssets/KeyTree";

import { descendKeyTree } from "#src/services/hostedAssets/descendKeyTree";

// oxlint-disable-next-line error-handling/no-bare-error -- the renderer runs from `nuxt prepare` before any workspace package is built, so it cannot import InvalidOperationError from @esposter/shared
const shareSelfSlot = (name: string) => new Error(`${name} shares its self slot with a segment named self in the lock`);

// A name that also prefixes other names sits under `self`, since one node cannot be both a string and a branch. A literal
// `self` segment is the one collision, and a name's string is the lock key it holds, which is the name's own path for every
// Product's lock
export const insertKey = (tree: KeyTree, name: string, lockKey: string): void => {
  const segments = name.split("/");
  const leaf = segments.pop() ?? name;
  const parent = segments.reduce((node, segment, index) => {
    // A self slot's string is the key of the node that holds it, so a path descends through it only when that key is the path's own
    const entry = node[segment];
    if (segment === "self" && typeof entry === "string" && entry !== segments.slice(0, index + 1).join("/"))
      throw shareSelfSlot(name);
    return descendKeyTree(node, segment);
  }, tree);
  const entry = parent[leaf];
  if (entry === undefined) parent[leaf] = lockKey;
  else if (typeof entry === "string" || entry.self !== undefined) throw shareSelfSlot(name);
  else entry.self = lockKey;
};
