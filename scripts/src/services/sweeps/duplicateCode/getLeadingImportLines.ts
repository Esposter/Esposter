import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";

// A comment line, which the leading block may hold between its imports.
const COMMENT_LINE_REGEX = /^\s*(?:\/\/|\/\*|\*)/u;

// The 1-based lines of a file's leading import block: from its first line through its last import declaration, with the
// Blank lines and comments between them. A blank line or a comment after the last import belongs to the body.
export const getLeadingImportLines = (text: string): Set<number> => {
  const nonImportLines = getNonImportLines(text);
  let leadingLength = 0;
  for (const [index, line] of text.split("\n").entries()) {
    const lineNumber = index + 1;
    if (nonImportLines.has(lineNumber)) {
      if (COMMENT_LINE_REGEX.test(line)) continue;
      break;
    }
    if (line.trim()) leadingLength = lineNumber;
  }
  return new Set(Array.from({ length: leadingLength }, (_, index) => index + 1));
};
