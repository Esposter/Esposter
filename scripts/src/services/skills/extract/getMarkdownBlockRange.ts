import type { ExtractMove } from "#src/models/skills/extract/ExtractMove";

import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { getFencedLines } from "#src/services/skills/extract/getFencedLines";
import { getHeadingLevels } from "#src/services/skills/extract/getHeadingLevels";
import { exhaustiveGuard, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The lines a move takes, as a half-open range. A section ends at the next heading of its own level or higher, so its
// Subsections go with it; a bullet ends at the next top-level item, a blank line or a heading, so its indented
// Continuation goes with it and a fence after a blank line does not. A line inside a fence is never a boundary, and a
// Match must name exactly one block, since a bullet's is a prefix that `- b` shares with `- b-other`
export const getMarkdownBlockRange = (
  lines: string[],
  { match, type }: Pick<ExtractMove, "match" | "type">,
): { end: number; start: number } => {
  const fencedLines = getFencedLines(lines);
  const headingLevels = getHeadingLevels(lines);
  const starts = lines.flatMap((line, index) =>
    !fencedLines[index] && (type === ExtractMoveType.Section ? line.trimEnd() === match : line.startsWith(match))
      ? [index]
      : [],
  );
  if (starts.length !== 1)
    throw new InvalidOperationError(
      Operation.Read,
      getMarkdownBlockRange.name,
      starts.length === 0 ? `no ${type} "${match}"` : `${starts.length} ${type}s match "${match}"`,
    );

  const start = takeOne(starts);
  const level = takeOne(headingLevels, start);
  const checkIsEnd = (line: string, index: number): boolean => {
    const lineLevel = takeOne(headingLevels, index);
    switch (type) {
      case ExtractMoveType.Bullet:
        return !fencedLines[index] && (line.startsWith("- ") || line.trim() === "" || lineLevel > 0);
      case ExtractMoveType.Section:
        return lineLevel > 0 && lineLevel <= level;
      default:
        return exhaustiveGuard(type);
    }
  };
  const end = lines.findIndex((line, index) => index > start && checkIsEnd(line, index));
  return { end: end === -1 ? lines.length : end, start };
};
