import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

import { UnityPropertyNames } from "#src/services/genshinAssets/UnityPropertyNames";
import { crc32 } from "node:zlib";

// Every path a node of a tree could be bound by: its path from each of its ancestors, since a binding's path runs from
// Its clip's animator, wherever that sits, down to the object it moves
const collectPaths = (node: InterfaceNode, paths: Set<string>): void => {
  const segments = node.path.split("/");
  for (let start = 0; start < segments.length; start++) paths.add(segments.slice(start).join("/"));
  for (const child of node.children) collectPaths(child, paths);
};
// A resolver of a clip's CRC32 hashes back to names: Unity's property names, and every path in the interface trees
// Given; the empty path, the animator's own, hashes to zero. A hash that matches nothing stays its number
export const createClipNameResolver = (trees: readonly InterfaceNode[]): ((hash: number) => string) => {
  const paths = new Set<string>([""]);
  for (const tree of trees) collectPaths(tree, paths);
  const hashNameMap = new Map<number, string>();
  for (const name of [...UnityPropertyNames, ...paths]) hashNameMap.set(crc32(name), name || "(the animator)");
  return (hash) => hashNameMap.get(hash) ?? String(hash);
};
