// An import declaration opens on a line starting with `import` and closes on the line that names its module, so a
// Multi-line list between them is part of the declaration too: a line of a copied import block is never code. The
// Module may be followed by its import attributes and a trailing comment, and the declaration still closes there, or,
// Where the attributes open a block of lines of their own, on the line that closes the block. A brace inside a comment
// Closes nothing, so each attributes pattern reads a block comment whole and stops at a line comment before a brace
const IMPORT_START_REGEX = /^\s*import[\s{*"']/u;
const IMPORT_END_REGEX =
  /(?:(?:^|\s)from|^\s*import)\s+["'][^"']+["'](?:\s+with\s*\{(?:\/\*.*?\*\/|(?!\/[/*])[^}])*\})?;?\s*(?:\/\/.*|\/\*.*\*\/\s*)?$/u;
const ATTRIBUTES_START_REGEX = /["']\s+with\s*\{(?:\/\*.*?\*\/|(?!\/[/*])[^}])*(?:\/\/.*|\/\*.*)?$/u;
const ATTRIBUTES_END_REGEX = /^(?:\/\*.*?\*\/|(?!\/[/*])[^}])*\};?\s*(?:\/\/.*|\/\*.*\*\/\s*)?$/u;

// The 1-based lines of a file that are code rather than an import declaration or a blank line.
export const getNonImportLines = (text: string): Set<number> => {
  const nonImportLines = new Set<number>();
  let isInImport = false;
  let isInAttributes = false;
  for (const [index, line] of text.split("\n").entries()) {
    const isImportLine = isInImport || IMPORT_START_REGEX.test(line);
    if (isImportLine) {
      isInImport = !(isInAttributes ? ATTRIBUTES_END_REGEX : IMPORT_END_REGEX).test(line);
      isInAttributes = isInImport && (isInAttributes || ATTRIBUTES_START_REGEX.test(line));
    } else if (line.trim()) nonImportLines.add(index + 1);
  }
  return nonImportLines;
};
