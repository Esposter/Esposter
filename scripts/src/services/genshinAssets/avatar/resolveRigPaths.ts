import { InvalidOperationError, Operation } from "@esposter/shared";
import { crc32 } from "node:zlib";

// The path of each bone of a rig, from its parents and the CRC32 of each bone's last name. A rig's table lists every
// Bone's full path by the CRC32 of that path, so each bone's path is the one table entry under its parent's path whose
// Last name hashes to its own. The root is the empty path, which the table holds for it under zero
export const resolveRigPaths = (
  parents: readonly number[],
  nameHashes: readonly number[],
  tablePaths: readonly string[],
): string[] => {
  const childPathsMap = Map.groupBy(tablePaths, (path) => path.slice(0, Math.max(path.lastIndexOf("/"), 0)));
  const paths: string[] = [];
  const pending = parents.flatMap((parent, bone) => (parent === -1 ? [bone] : []));
  for (const root of pending) paths[root] = "";
  for (const bone of pending) {
    const path = paths[bone] ?? "";
    for (const [child, parent] of parents.entries()) {
      if (parent !== bone) continue;
      const matches = (childPathsMap.get(path) ?? []).filter(
        (childPath) => crc32(childPath.slice(childPath.lastIndexOf("/") + 1)) === nameHashes[child],
      );
      const [match] = matches;
      if (matches.length !== 1 || match === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          `bone ${child} of ${path || "the root"}`,
          `matches ${matches.length} paths of the rig's table, not one`,
        );
      paths[child] = match;
      pending.push(child);
    }
  }
  return paths;
};
