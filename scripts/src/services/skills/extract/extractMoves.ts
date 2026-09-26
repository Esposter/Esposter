import type { ExtractSpec } from "#src/models/skills/extract/ExtractSpec";

import { ExtractMoveType } from "#src/models/skills/extract/ExtractMoveType";
import { getHeadingLevel } from "#src/services/skills/extract/getHeadingLevel";
import { getMarkdownBlockRange } from "#src/services/skills/extract/getMarkdownBlockRange";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

const DEFAULT_INDEX_HEADING = "## Deep Dives";
const READ_OPENING = "Read ";
const collapseBlankLines = (text: string) => `${text.replaceAll(/\n{3,}/gu, "\n\n").trimEnd()}\n`;
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
    const level = getHeadingLevel(heading);
    const blockLines =
      move.type === ExtractMoveType.Section
        ? lines.slice(start + 1, end).map((line) => (getHeadingLevel(line) > level ? line.slice(level - 1) : line))
        : lines.slice(start, end);
    const keepLines = move.keep === undefined ? [] : move.keep.split("\n");
    const replacement =
      move.type === ExtractMoveType.Section && keepLines.length > 0 ? [heading, "", ...keepLines, ""] : keepLines;
    lines = [...lines.slice(0, start), ...replacement, ...lines.slice(end)];
    if (move.isDropped) continue;

    const existingPage = readPage(move.page);
    const sections = pageSectionsMap.get(move.page) ?? [];
    if (sections.length === 0 && !existingPage) {
      if (!move.title || !move.read?.startsWith(READ_OPENING))
        throw new InvalidOperationError(
          Operation.Create,
          skill,
          `page "${move.page}" needs a title and a read line opening "${READ_OPENING}"`,
        );
      sections.push(`# ${move.title}`, move.read);
      if (move.index) indexLines.push(move.index);
    }
    if (move.subheading) sections.push(`## ${move.subheading}`);
    sections.push(trimBlankLines(blockLines).join("\n"));
    pageSectionsMap.set(move.page, sections);
  }

  const pages = new Map(
    Array.from(pageSectionsMap, ([page, sections]) => {
      const existingPage = readPage(page);
      return [page, collapseBlankLines([existingPage.trimEnd(), ...sections].filter(Boolean).join("\n\n"))];
    }),
  );
  const indexStart = lines.findIndex((line) => line.trimEnd() === indexHeading);
  if (indexLines.length === 0) return { pages, skillText: collapseBlankLines(lines.join("\n")) };
  else if (indexStart === -1)
    return { pages, skillText: collapseBlankLines([...lines, "", indexHeading, "", ...indexLines].join("\n")) };

  const nextHeading = lines.findIndex(
    (line, index) =>
      index > indexStart && getHeadingLevel(line) > 0 && getHeadingLevel(line) <= getHeadingLevel(indexHeading),
  );
  const indexEnd =
    lines.slice(0, nextHeading === -1 ? lines.length : nextHeading).findLastIndex((line) => line.trim() !== "") + 1;
  return {
    pages,
    skillText: collapseBlankLines(
      [...lines.slice(0, indexEnd), ...indexLines, "", ...lines.slice(indexEnd)].join("\n"),
    ),
  };
};
