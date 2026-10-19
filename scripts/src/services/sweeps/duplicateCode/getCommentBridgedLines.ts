// The 1-based lines that are wholly a comment: a `//` line, a `/* … */` on one line, or each line of a block comment, a
// JSDoc included, which opens on a line starting with `/*` and closes on the line ending in `*/`. A line of code with a
// Comment beside it is code, so only a line that is nothing but a comment counts.
const getCommentLines = (lines: string[]): Set<number> => {
  const commentLines = new Set<number>();
  let isInBlockComment = false;
  for (const [index, line] of lines.entries()) {
    const trimmedLine = line.trim();
    if (isInBlockComment) {
      commentLines.add(index + 1);
      isInBlockComment = !trimmedLine.endsWith("*/");
    } else if (trimmedLine.startsWith("//") || (trimmedLine.startsWith("/*") && trimmedLine.endsWith("*/"))) {
      commentLines.add(index + 1);
    } else if (trimmedLine.startsWith("/*") && !trimmedLine.includes("*/")) {
      commentLines.add(index + 1);
      isInBlockComment = true;
    }
  }
  return commentLines;
};

// The lines of `kindLines` with the comment lines between two of them added, since a comment carries no logic and is
// Part of the run it sits in. Blank lines are passed over as a range check passes over them, and a comment beside code
// Stays code.
export const getCommentBridgedLines = (text: string, kindLines: Set<number>): Set<number> => {
  const lines = text.split("\n");
  const commentLines = getCommentLines(lines);
  const bridgedLines = new Set(kindLines);
  let previousCodeLine: number | undefined;
  let pendingCommentLines: number[] = [];
  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (commentLines.has(lineNumber)) {
      pendingCommentLines.push(lineNumber);
    } else if (line.trim()) {
      if (previousCodeLine !== undefined && kindLines.has(previousCodeLine) && kindLines.has(lineNumber))
        for (const commentLine of pendingCommentLines) bridgedLines.add(commentLine);
      pendingCommentLines = [];
      previousCodeLine = lineNumber;
    }
  }
  return bridgedLines;
};
