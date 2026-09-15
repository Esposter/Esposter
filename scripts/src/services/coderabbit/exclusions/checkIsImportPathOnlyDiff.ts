import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { DiffLineSign } from "#src/models/coderabbit/shared/DiffLineSign";
// A file's `git diff -U0 -M` output, judged as an import-path-only edit: a module moved and the file's entire
// Diff is the same imports pointing at the new path. "Every changed line is an import" is not the test — a new
// Symbol, a new package or an added side-effect import passes it — so the added imports must be the removed ones
// With only the quoted specifier differing, which blanking every quoted string turns into a set comparison, and
// Every specifier must name one end of a rename the same range carries: a swap between two modules that both
// Exist is a content change wearing an import's shape.
const MODE_CHANGE_REGEX = /^(?:old|new|deleted file|new file) mode /u;
const CHANGED_LINE_REGEX = /^[+-]/u;
const DIFF_HEADER_REGEX = /^(?:\+\+\+|---)/u;
const IMPORT_OR_BLANK_REGEX = /^[+-]\s*(?:import\s|$)/u;
const SIDE_EFFECT_IMPORT_REGEX = /^[+-]\s*import\s+["']/u;
const SECOND_QUOTED_VALUE_REGEX = /"[^"]*"[^"]*"/u;
const QUOTED_STRING_REGEX = /"[^"]*"/gu;
const SPECIFIER_REGEX = /from\s+"(?<specifier>[^"]+)"/u;
// The segments an import alias or a relative walk puts before the path it names: `@/`, `#src/`, `~/`, `../`
const ALIAS_OR_RELATIVE_SEGMENT_REGEX = /^[@#~.]/u;
// A module's extension, and the `/index` a directory import leaves off
const MODULE_STEM_SUFFIX_REGEX = /(?:\/index)?\.[^./]+$/u;

// Compared as a sorted set rather than in place: `perfectionist/sort-imports` owns import order, so a repathed import
// Re-sorts among its neighbours and an in-place compare would keep every such file in review for an order no
// Reviewer decides. The one import whose position is meaning — a side-effect import — is refused before this runs
const getBlankedLines = (changedLines: string[], sign: DiffLineSign): string =>
  changedLines
    .filter((line) => line.startsWith(sign))
    .map((line) => line.slice(1).replaceAll(QUOTED_STRING_REGEX, '""'))
    .toSorted()
    .join("\n");

// The path an import names once its alias or relative prefix is dropped, which is what a rename row's path ends
// With whichever alias the importer resolved it through
const getSpecifierTail = (specifier: string): string => {
  const segments = specifier.split("/");
  const start = segments.findIndex((segment) => !ALIAS_OR_RELATIVE_SEGMENT_REGEX.test(segment));
  return start === -1 ? "" : segments.slice(start).join("/");
};

const checkIsNamedBy = (path: string, tail: string): boolean => {
  const stem = path.replace(MODULE_STEM_SUFFIX_REGEX, "");
  return tail !== "" && (stem === tail || stem.endsWith(`/${tail}`));
};

// Every changed import of one sign names a path on the matching end of some rename; a blank line names nothing
// And passes, an import line with no readable specifier proves nothing and fails
const checkFollowsMoves = (changedLines: string[], sign: DiffLineSign, paths: string[]): boolean =>
  changedLines
    .filter((line) => line.startsWith(sign) && line.slice(1).trim() !== "")
    .every((line) => {
      const specifier = SPECIFIER_REGEX.exec(line)?.groups?.specifier;
      return specifier !== undefined && paths.some((path) => checkIsNamedBy(path, getSpecifierTail(specifier)));
    });

export const checkIsImportPathOnlyDiff = (diff: string, rows: NameStatusRow[]): boolean => {
  const lines = diff.split("\n");
  // A mode flip rides in the diff header rather than on a +/- line, so it would survive every filter below and
  // Leave a permission change unreviewed
  if (lines.some((line) => MODE_CHANGE_REGEX.test(line))) return false;
  // -U0 means no context lines can be mistaken for changes; the +++/--- headers are dropped
  const changedLines = lines.filter((line) => CHANGED_LINE_REGEX.test(line) && !DIFF_HEADER_REGEX.test(line));
  if (changedLines.length === 0) return false;
  if (changedLines.some((line) => !IMPORT_OR_BLANK_REGEX.test(line))) return false;
  // A bare side-effect import is sequenced for its effect, and the sorted compare below cannot tell a reordering
  // Of them from a repathing
  if (changedLines.some((line) => SIDE_EFFECT_IMPORT_REGEX.test(line))) return false;
  // An import attribute value is quoted too (`with { type: "json" }`), so blanking every quoted string would
  // Normalize a changed attribute away — a line carrying a second quoted value stays in the review set
  if (changedLines.some((line) => SECOND_QUOTED_VALUE_REGEX.test(line))) return false;
  if (getBlankedLines(changedLines, DiffLineSign.Added) !== getBlankedLines(changedLines, DiffLineSign.Removed))
    return false;

  const renamedFromPaths = rows.flatMap(({ renamedFrom }) => (renamedFrom === undefined ? [] : [renamedFrom]));
  const renamedToPaths = rows.filter(({ renamedFrom }) => renamedFrom !== undefined).map(({ path }) => path);
  return (
    checkFollowsMoves(changedLines, DiffLineSign.Removed, renamedFromPaths) &&
    checkFollowsMoves(changedLines, DiffLineSign.Added, renamedToPaths)
  );
};
