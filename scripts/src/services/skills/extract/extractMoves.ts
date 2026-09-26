import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { getHeadingLevels } from "#src/services/skills/extract/getHeadingLevels";
import { getMarkdownBlockRange } from "#src/services/skills/extract/getMarkdownBlockRange";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

const DEFAULT_INDEX_HEADING = "## Deep Dives";
const READ_OPENING = "Read ";
const toText = (lines: string[]) => `${lines.join("\n").trimEnd()}\n`;
// Collapses the run of blank lines around `index` to one — only where a splice joined two blocks, so a run inside
// Content the move never touched, such as a fenced example, is left as written
const collapseBlankLinesAt = (lines: string[], index: number) => {
  let first = index;
  while (first > 0 && lines[first - 1]?.trim() === "") first--;
  let last = index;
  while (last < lines.length && lines[last]?.trim() === "") last++;
  return last - first > 1 ? [...lines.slice(0, first + 1), ...lines.slice(last)] : lines;
};
const trimBlankLines = (lines: string[]) => {
  const first = lines.findIndex((line) => line.trim() !== "");
  const last = lines.findLastIndex((line) => line.trim() !== "");
  return first === -1 ? [] : lines.slice(first, last + 1);
};
// Moves each block of a SKILL.md verbatim onto its reference page, leaving the one-line rule in its place, and indexes
// Every page it creates. A page that exists is appended to, under the move's subheading; a new one opens on its title
// And its "Read when…" line, which is what a reader arriving by search needs first. `readPage` answers "" for a page
// Not on disk. Pure, so the whole move is decided before any file is written
export const extractMoves = (
  { indexHeading = DEFAULT_INDEX_HEADING, moves, skill }: ExtractSpec,
  skillText: string,
  readPage: (page: string) => string,
): { pages: Map<string, string>; skillText: string } => {
  let lines = skillText.split("\n");
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
  const headingLevels = getHeadingLevels(lines);
  const indexStart = lines.findIndex(
    (line, index) => takeOne(headingLevels, index) > 0 && line.trimEnd() === indexHeading,
  );
  if (indexLines.length === 0) return { pages, skillText: toText(lines) };
  else if (indexStart === -1)
    return { pages, skillText: toText([lines.join("\n").trimEnd(), "", indexHeading, "", ...indexLines]) };

  const indexLevel = takeOne(headingLevels, indexStart);
  const nextHeading = headingLevels.findIndex(
    (headingLevel, index) => index > indexStart && headingLevel > 0 && headingLevel <= indexLevel,
  );
  const indexEnd =
    lines.slice(0, nextHeading === -1 ? lines.length : nextHeading).findLastIndex((line) => line.trim() !== "") + 1;
  return {
    pages,
    skillText: toText(
      collapseBlankLinesAt(
        [...lines.slice(0, indexEnd), ...indexLines, "", ...lines.slice(indexEnd)],
        indexEnd + indexLines.length,
      ),
    ),
  };
};
