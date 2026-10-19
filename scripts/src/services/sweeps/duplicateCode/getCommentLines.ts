// The 1-based lines that are wholly a comment: a `//` line, a `/* … */` on one line, or each line of a block comment, a
// JSDoc included, which opens on a line starting with `/*` and closes on the line ending in `*/`. A line of code with a
// Comment beside it is code, so only a line that is nothing but a comment counts.
export const getCommentLines = (lines: string[]): Set<number> => {
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
