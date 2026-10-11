// An import declaration opens on a line starting with `import` and closes on the line that names its module, so a
// Multi-line list between them is part of the declaration too: a line of a copied import block is never code.
const IMPORT_START_REGEX = /^\s*import[\s{*"']/u;
const IMPORT_END_REGEX = /(?:^|\s)from\s+["'][^"']+["'];?\s*$|^\s*import\s+["'][^"']+["'];?\s*$/u;

// The 1-based lines of a file that are code rather than an import declaration or a blank line.
export const getNonImportLines = (text: string): Set<number> => {
  const nonImportLines = new Set<number>();
  let isInImport = false;
  for (const [index, line] of text.split("\n").entries()) {
    const isImportLine = isInImport || IMPORT_START_REGEX.test(line);
    if (isImportLine) isInImport = !IMPORT_END_REGEX.test(line);
    else if (line.trim()) nonImportLines.add(index + 1);
  }
  return nonImportLines;
};
