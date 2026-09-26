import type { ExtractMove } from "#src/models/skills/extract/ExtractMove";

import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { getHeadingLevel } from "#src/services/skills/extract/getHeadingLevel";
import { exhaustiveGuard, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The lines a move takes, as a half-open range. A section ends at the next heading of its own level or higher, so its
// Subsections go with it; a bullet ends at the next top-level item, a blank line or a heading, so its indented
// Continuation goes with it and a fence after a blank line does not
export const getMarkdownBlockRange = (
  lines: string[],
  { match, type }: Pick<ExtractMove, "match" | "type">,
): { end: number; start: number } => {
  const start = lines.findIndex((line) =>
    type === ExtractMoveType.Section ? line.trimEnd() === match : line.startsWith(match),
  );
  if (start === -1)
    throw new InvalidOperationError(Operation.Read, getMarkdownBlockRange.name, `no ${type} "${match}"`);

  const level = getHeadingLevel(takeOne(lines, start));
  const checkIsEnd = (line: string): boolean => {
    switch (type) {
      case ExtractMoveType.Bullet:
        return line.startsWith("- ") || line.trim() === "" || getHeadingLevel(line) > 0;
      case ExtractMoveType.Section: {
        const lineLevel = getHeadingLevel(line);
        return lineLevel > 0 && lineLevel <= level;
      }
      default:
        return exhaustiveGuard(type);
    }
  };
  const end = lines.findIndex((line, index) => index > start && checkIsEnd(line));
  return { end: end === -1 ? lines.length : end, start };
};
