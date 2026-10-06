import { UnityPropertyNames } from "#src/services/genshinAssets/interface/UnityPropertyNames";
import { crc32 } from "node:zlib";

// A resolver of a clip's CRC32 hashes back to names: Unity's property names, and every path given from each of its
// Ancestors, since a binding's path runs from its clip's animator, wherever that sits, down to the object it moves (a
// Skinned mesh names its bones the same way); the empty path, the animator's own, hashes to zero. A hash that matches
// Nothing stays its number
export const createClipNameResolver = (paths: readonly string[]): ((hash: number) => string) => {
  const suffixes = new Set<string>([""]);
  for (const path of paths) {
    const segments = path.split("/");
    for (let start = 0; start < segments.length; start++) suffixes.add(segments.slice(start).join("/"));
  }
  const hashNameMap = new Map<number, string>();
  for (const name of [...UnityPropertyNames, ...suffixes]) hashNameMap.set(crc32(name), name || "(the animator)");
  return (hash) => hashNameMap.get(hash) ?? String(hash);
};
