import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { DiffLineSign } from "#src/models/coderabbit/shared/DiffLineSign";
// A file's `git diff -U0 -M` output, judged as an import-path-only edit: a module moved and the file's entire
// Diff is the same imports pointing at the new path. "Every changed line is an import" is not the test — a new
// Symbol, a new package or an added side-effect import passes it — so the added imports must be the removed ones
// With only the quoted specifier differing, which blanking every quoted string turns into a set comparison, and
// Each removed import and the added import it blanks to must name the two ends of one rename the same range
// Carries, and of only one rename: a swap between two modules that both exist is a content change wearing an
// Import's shape, and so is a swap between two the range renamed past each other.
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

// A changed line with the path it names blanked out: everything a repathing leaves alone
const getBlankedLine = (line: string): string => line.slice(1).replaceAll(QUOTED_STRING_REGEX, '""');

// Compared as a sorted set rather than in place: `perfectionist/sort-imports` owns import order, so a repathed import
// Re-sorts among its neighbours and an in-place compare would keep every such file in review for an order no
// Reviewer decides. The one import whose position is meaning — a side-effect import — is refused before this runs
const getBlankedLines = (changedLines: string[], sign: DiffLineSign): string =>
  changedLines
    .filter((line) => line.startsWith(sign))
    .map((line) => getBlankedLine(line))
    .toSorted()
    .join("\n");

// The importing lines of one sign in the order the set compare above already matched them in, so the line at an
// Index on one side is the one its counterpart blanks to on the other. A blank line names nothing and is dropped
const getSortedImportLines = (changedLines: string[], sign: DiffLineSign): string[] =>
  changedLines
    .filter((line) => line.startsWith(sign) && line.slice(1).trim() !== "")
    .map((line) => ({ blanked: getBlankedLine(line), line }))
    .toSorted(({ blanked: left }, { blanked: right }) => left.localeCompare(right))
    .map(({ line }) => line);

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

// A tail that names one move's source while a different move's destination answers to it too is one name standing
// For two modules across the same range — two modules renamed past each other, or a chain of renames through one
// Path — so the import that followed either move reads exactly like the one that changed module
const checkIsAmbiguous = (moves: { from: string; to: string }[], tail: string): boolean =>
  moves.some(
    ({ from }, index) =>
      checkIsNamedBy(from, tail) &&
      moves.some(({ to }, otherIndex) => otherIndex !== index && checkIsNamedBy(to, tail)),
  );

// A removed import and the added import it blanks to are the two halves of one repathing, so one move has to name
// Both ends of that pair, and no other rename may answer to either tail. Judged a sign at a time instead, a range
// Carrying `a` -> `b` beside `c` -> `d` reads an import repointed from `a` to `d` as followed, while it now loads
// The other module's contents — the blanked compare cannot see it, since it reads everything but the specifier.
// An import line with no readable specifier proves nothing and fails
const checkFollowsMoves = (changedLines: string[], moves: { from: string; to: string }[]): boolean => {
  const removedLines = getSortedImportLines(changedLines, DiffLineSign.Removed);
  const addedLines = getSortedImportLines(changedLines, DiffLineSign.Added);
  return removedLines.every((removedLine, index) => {
    const addedLine = addedLines[index];
    if (addedLine === undefined) return false;

    const removedSpecifier = SPECIFIER_REGEX.exec(removedLine)?.groups?.specifier;
    const addedSpecifier = SPECIFIER_REGEX.exec(addedLine)?.groups?.specifier;
    if (removedSpecifier === undefined || addedSpecifier === undefined) return false;

    const fromTail = getSpecifierTail(removedSpecifier);
    const toTail = getSpecifierTail(addedSpecifier);
    return (
      !checkIsAmbiguous(moves, fromTail) &&
      !checkIsAmbiguous(moves, toTail) &&
      moves.some(({ from, to }) => checkIsNamedBy(from, fromTail) && checkIsNamedBy(to, toTail))
    );
  });
};

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

  // Source and destination stay paired, so a specifier is read against the ends of one rename rather than against
  // Two sets that no longer say which destination each source moved to
  const moves = rows.flatMap(({ path, renamedFrom }) =>
    renamedFrom === undefined ? [] : [{ from: renamedFrom, to: path }],
  );
  return checkFollowsMoves(changedLines, moves);
};
