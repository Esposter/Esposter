import { RENAME_OR_MODIFY_ROW_REGEX } from "#src/services/coderabbit/exclusions/constants";

// A rename is invisible to a diff scoped to one path: `diff -- <newPath>` filters the counterpart out of the
// Pair, so git has nothing to rename-detect against and reports the file as wholly new. Every classifier reading
// That output then sees the entire content as added, which is why a moved file whose only edit is its own
// Repathed imports — the most common file in a folder sweep — qualifies under no predicate. Passing both paths
// Restores the pairing, and only a renamed file has a second one to pass.
export const getRenamedFromPaths = (nameStatus: string): Map<string, string> =>
  new Map(
    nameStatus.split("\n").flatMap((line) => {
      const groups = RENAME_OR_MODIFY_ROW_REGEX.exec(line)?.groups;
      if (groups?.oldPath === undefined || groups.newPath === undefined) return [];
      const pair: [string, string] = [groups.newPath, groups.oldPath];
      return [pair];
    }),
  );
