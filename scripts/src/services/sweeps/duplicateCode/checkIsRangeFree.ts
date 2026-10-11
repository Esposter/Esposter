// A range is free when none of its lines is code under the reader that made `codeLines`, so a block of imports, of
// Declarations or of enum-keyed rows two files share is each file's own list of what it holds, not duplicated logic.
export const checkIsRangeFree = (startLine: number, endLine: number, codeLines: Set<number>): boolean => {
  for (let line = startLine; line <= endLine; line++) if (codeLines.has(line)) return false;
  return true;
};
