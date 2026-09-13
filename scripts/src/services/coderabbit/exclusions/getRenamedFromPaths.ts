import { getNameStatusEntries } from "#src/services/coderabbit/exclusions/getNameStatusEntries";

// A rename is invisible to a diff scoped to one path: `diff -- <newPath>` filters the counterpart out of the
// pair, so git has nothing to rename-detect against and reports the file as wholly new. Every classifier reading
// that output then sees the entire content as added, which is why a moved file whose only edit is its own
// repathed imports — the most common file in a folder sweep — qualifies under no predicate. Passing both paths
// restores the pairing, and only a renamed file has a second one to pass.
export const getRenamedFromPaths = (nameStatus: string): Map<string, string> =>
  new Map(
    getNameStatusEntries(nameStatus).flatMap(({ path, renamedFromPath }) =>
      renamedFromPath === undefined ? [] : [[path, renamedFromPath] as [string, string]],
    ),
  );
