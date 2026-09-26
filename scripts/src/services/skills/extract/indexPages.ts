import { getHeadingLevels } from "#src/services/skills/extract/getHeadingLevels";
import { takeOne } from "@esposter/shared";

export const DEFAULT_INDEX_HEADING = "## Deep Dives";
export const toText = (lines: string[]): string => `${lines.join("\n").trimEnd()}\n`;
// Collapses the run of blank lines around `index` to one — only where a splice joined two blocks, so a run inside
// Content the move never touched, such as a fenced example, is left as written
export const collapseBlankLinesAt = (lines: string[], index: number): string[] => {
  let first = index;
  while (first > 0 && lines[first - 1]?.trim() === "") first--;
  let last = index;
  while (last < lines.length && lines[last]?.trim() === "") last++;
  return last - first > 1 ? [...lines.slice(0, first + 1), ...lines.slice(last)] : lines;
};
// Appends each new page's index line to the end of the SKILL.md list under the index heading, creating the heading at
// The end of the file when the skill has none yet
export const indexPages = (
  skillText: string,
  indexLines: string[],
  indexHeading: string = DEFAULT_INDEX_HEADING,
): string => {
  const lines = skillText.split("\n");
  const headingLevels = getHeadingLevels(lines);
  const indexStart = lines.findIndex(
    (line, index) => takeOne(headingLevels, index) > 0 && line.trimEnd() === indexHeading,
  );
  if (indexLines.length === 0) return toText(lines);
  else if (indexStart === -1) return toText([lines.join("\n").trimEnd(), "", indexHeading, "", ...indexLines]);

  const indexLevel = takeOne(headingLevels, indexStart);
  const nextHeading = headingLevels.findIndex(
    (headingLevel, index) => index > indexStart && headingLevel > 0 && headingLevel <= indexLevel,
  );
  const indexEnd =
    lines.slice(0, nextHeading === -1 ? lines.length : nextHeading).findLastIndex((line) => line.trim() !== "") + 1;
  return toText(
    collapseBlankLinesAt(
      [...lines.slice(0, indexEnd), ...indexLines, "", ...lines.slice(indexEnd)],
      indexEnd + indexLines.length,
    ),
  );
};
