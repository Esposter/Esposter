import { blankBlockComments } from "#src/services/sweeps/duplicateCode/blankBlockComments";

// An import declaration opens on a line starting with `import` and closes on the line that names its module, so a
// Multi-line list between them is part of the declaration too: a line of a copied import block is never code. The
// Module may be followed by its import attributes and a trailing comment, and the declaration still closes there, or,
// Where the attributes open a block of lines of their own, on the line that closes the block. Block comments are
// Blanked before any pattern reads a line, and one left open is carried to the next line, so a brace or a `from`
// Inside a comment closes nothing.
const IMPORT_START_REGEX = /^\s*import[\s{*"']/u;
const IMPORT_END_REGEX =
  /(?:(?:^|\s)from|^\s*import)\s+["'][^"']+["'](?:\s+with\s*\{(?:(?!\/\/)[^}])*\})?;?\s*(?:\/\/.*)?$/u;
const ATTRIBUTES_START_REGEX = /["']\s+with\s*\{(?:(?!\/\/)[^}])*(?:\/\/.*)?$/u;
const ATTRIBUTES_END_REGEX = /^(?:(?!\/\/)[^}])*\};?\s*(?:\/\/.*)?$/u;

// The 1-based lines of a file that are code rather than an import declaration or a blank line.
export const getNonImportLines = (text: string): Set<number> => {
  const nonImportLines = new Set<number>();
  let isInBlockComment = false;
  let isInImport = false;
  let isInAttributes = false;
  for (const [index, line] of text.split("\n").entries()) {
    const blanked = blankBlockComments(line, isInBlockComment);
    isInBlockComment = blanked.isInBlockComment;
    const isImportLine = isInImport || IMPORT_START_REGEX.test(blanked.code);
    if (isImportLine) {
      isInImport = !(isInAttributes ? ATTRIBUTES_END_REGEX : IMPORT_END_REGEX).test(blanked.code);
      isInAttributes = isInImport && (isInAttributes || ATTRIBUTES_START_REGEX.test(blanked.code));
    } else if (line.trim()) nonImportLines.add(index + 1);
  }
  return nonImportLines;
};
