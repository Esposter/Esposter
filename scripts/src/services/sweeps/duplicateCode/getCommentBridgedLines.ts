import { getCommentLines } from "#src/services/sweeps/duplicateCode/getCommentLines";

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
    if (commentLines.has(lineNumber)) pendingCommentLines.push(lineNumber);
    else if (line.trim()) {
      if (previousCodeLine !== undefined && kindLines.has(previousCodeLine) && kindLines.has(lineNumber))
        for (const commentLine of pendingCommentLines) bridgedLines.add(commentLine);
      pendingCommentLines = [];
      previousCodeLine = lineNumber;
    }
  }
  return bridgedLines;
};
