import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";
import { getRecordRowLines } from "#src/services/sweeps/duplicateCode/getRecordRowLines";

// The 1-based lines of a file that are code once its enum-keyed record rows are read as data.
export const getNonRecordRowLines = (text: string): Set<number> => {
  const recordRowLines = getRecordRowLines(text);
  return new Set([...getNonImportLines(text)].filter((line) => !recordRowLines.has(line)));
};
