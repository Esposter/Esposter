import type { DuplicateCodeFragment } from "#src/models/sweeps/duplicateCode/DuplicateCodeFragment";

import { getCommentLines } from "#src/services/sweeps/duplicateCode/getCommentLines";
import { takeOne } from "@esposter/shared";

// The 1-based first and last lines a clone covers whole. A clone runs from token to token, so it can enter its first line
// At that line's closing tokens and leave its last after the next statement's first, and those edge lines belong to other
// Statements. The comment and blank lines then left at either edge go too, since the tokenizer skips them.
export const getCloneLineRange = (
  text: string,
  { end, start }: Pick<DuplicateCodeFragment, "end" | "start">,
): { endLine: number; startLine: number } => {
  const lines = text.split("\n");
  const commentLines = getCommentLines(lines);
  const checkIsTokenless = (lineNumber: number) =>
    commentLines.has(lineNumber) || !takeOne(lines, lineNumber - 1).trim();
  const firstLine = takeOne(lines, start.line - 1);
  let startLine = start.column > firstLine.length - firstLine.trimStart().length ? start.line + 1 : start.line;
  let endLine = end.column < takeOne(lines, end.line - 1).trimEnd().length ? end.line - 1 : end.line;
  while (startLine <= endLine && checkIsTokenless(startLine)) startLine++;
  while (endLine >= startLine && checkIsTokenless(endLine)) endLine--;
  return { endLine, startLine };
};
