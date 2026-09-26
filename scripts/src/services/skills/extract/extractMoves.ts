import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { getHeadingLevels } from "#src/services/skills/extract/getHeadingLevels";
import { getMarkdownBlockRange } from "#src/services/skills/extract/getMarkdownBlockRange";
import { collapseBlankLinesAt, toText } from "#src/services/skills/extract/indexPages";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

const READ_OPENING = "Read ";
const trimBlankLines = (lines: string[]) => {
  const first = lines.findIndex((line) => line.trim() !== "");
  const last = lines.findLastIndex((line) => line.trim() !== "");
  return first === -1 ? [] : lines.slice(first, last + 1);
};
// Moves each block of a skill file — its SKILL.md, or one of its pages being split — verbatim onto its reference page,
// Leaving the one-line rule in its place, and returns the index line of every page it creates for `indexPages`. A page
// That exists is appended to, under the move's subheading; a new one opens on its title and its "Read when…" line,
// Which is what a reader arriving by search needs first. `readPage` answers "" for a page not on disk. Pure, so the
// Whole move is decided before any file is written
export const extractMoves = (
  { moves, skill }: ExtractSpec,
  sourceText: string,
  readPage: (page: string) => string,
): { indexLines: string[]; pages: Map<string, string>; sourceText: string } => {
  let lines = sourceText.split("\n");
  const pageSectionsMap = new Map<string, string[]>();
  const indexLines: string[] = [];
  for (const move of moves) {
    const { end, start } = getMarkdownBlockRange(lines, move);
    const heading = takeOne(lines, start);
    const headingLevels = getHeadingLevels(lines);
    const level = takeOne(headingLevels, start);
    const blockLines =
      move.type === ExtractMoveType.Section
        ? lines
            .slice(start + 1, end)
            .map((line, index) => (takeOne(headingLevels, start + 1 + index) > level ? line.slice(level - 1) : line))
        : lines.slice(start, end);
    const keepLines = move.keep === undefined ? [] : move.keep.split("\n");
    const replacement =
      move.type === ExtractMoveType.Section && keepLines.length > 0 ? [heading, "", ...keepLines, ""] : keepLines;
    lines = collapseBlankLinesAt(
      collapseBlankLinesAt([...lines.slice(0, start), ...replacement, ...lines.slice(end)], start + replacement.length),
      start,
    );
    if (move.isDropped) continue;

    const existingPage = readPage(move.page);
    const sections = pageSectionsMap.get(move.page) ?? [];
    if (sections.length === 0 && !existingPage) {
      if (!move.title || !move.read?.startsWith(READ_OPENING) || !move.index)
        throw new InvalidOperationError(
          Operation.Create,
          skill,
          `page "${move.page}" needs a title, a read line opening "${READ_OPENING}" and an index line`,
        );
      sections.push(`# ${move.title}`, move.read);
      indexLines.push(move.index);
    }
    if (move.subheading) sections.push(`## ${move.subheading}`);
    sections.push(trimBlankLines(blockLines).join("\n"));
    pageSectionsMap.set(move.page, sections);
  }

  const pages = new Map(
    Array.from(pageSectionsMap, ([page, sections]) => {
      const existingPage = readPage(page);
      return [page, toText([[existingPage.trimEnd(), ...sections].filter(Boolean).join("\n\n")])];
    }),
  );
  return { indexLines, pages, sourceText: toText(lines) };
};
