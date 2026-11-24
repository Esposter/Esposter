import { PRINT_WIDTH } from "@esposter/configuration/oxfmt";

// The physical lines a comment fills that run past the print width with nothing but the comment on them, each with its
// Length and its number. The comment starts on `firstLine`, and a line it shares with code is that code's line
export const findOverWidthCommentLines = (
  text: string,
  start: number,
  end: number,
  firstLine: number,
): { length: number; lineNumber: number }[] => {
  const overWidthLines: { length: number; lineNumber: number }[] = [];
  let lineNumber = firstLine;
  for (let lineStart = text.lastIndexOf("\n", start - 1) + 1; lineStart <= end; lineNumber++) {
    const newline = text.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? text.length : newline;
    const line = text.slice(lineStart, lineEnd);
    const codeBefore = lineStart < start ? text.slice(lineStart, start) : "";
    const codeAfter = lineEnd > end ? text.slice(end, lineEnd) : "";
    if (codeBefore.trim() === "" && codeAfter.trim() === "" && line.length > PRINT_WIDTH)
      overWidthLines.push({ length: line.length, lineNumber });
    lineStart = lineEnd + 1;
  }
  return overWidthLines;
};
