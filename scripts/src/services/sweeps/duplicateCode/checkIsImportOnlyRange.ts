// A range is import-only when none of its lines is code: a block of imports two files share is each file's own list
// Of what it uses, so it is not duplicated logic whatever the clone detector measured.
export const checkIsImportOnlyRange = (startLine: number, endLine: number, nonImportLines: Set<number>): boolean => {
  for (let line = startLine; line <= endLine; line++) if (nonImportLines.has(line)) return false;
  return true;
};
