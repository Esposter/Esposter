import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

// Read whole so git sees every rename — a diff scoped to one path filters the counterpart out of the pair. Files
// Are matched by the exact header the `--name-status` rows predict: a path with a space is ambiguous to parse
// And exact to predict, and a header nothing predicts is absent, which every caller reads as not proven.
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
