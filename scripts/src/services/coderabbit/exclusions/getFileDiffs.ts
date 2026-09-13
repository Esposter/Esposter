import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

// A whole-range `git diff` is one document with a `diff --git a/<old> b/<new>` line opening each file, and
// Reading it whole is what lets git see every rename: a diff scoped to one path filters the counterpart out of
// The pair, and the moved file whose only edit is its own repathed imports — the most common file in a sweep —
// Then reads as wholly new. Files are matched by the exact header the `--name-status` rows predict rather than
// By parsing the header, because a path with a space is ambiguous to parse and exact to predict; a file whose
// Header nothing predicts (git quoting a path this cannot spell) is simply absent, which every caller reads as
// "not proven mechanical".
const FILE_HEADER_PREFIX = "diff --git ";

const FILE_START_REGEX = /^(?=diff --git )/mu;

export const getFileDiffs = (diff: string, rows: NameStatusRow[]): Map<string, string> => {
  const headerPathMap = new Map(
    rows.map(({ path, renamedFrom }) => [`${FILE_HEADER_PREFIX}a/${renamedFrom ?? path} b/${path}`, path]),
  );
  return new Map(
    diff.split(FILE_START_REGEX).flatMap((fileDiff) => {
      const path = headerPathMap.get(fileDiff.split("\n", 1)[0] ?? "");
      if (path === undefined) return [];
      const entry: [string, string] = [path, fileDiff];
      return [entry];
    }),
  );
};
