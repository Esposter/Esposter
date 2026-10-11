import { getDataRowLines } from "#src/services/sweeps/duplicateCode/getDataRowLines";
import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";

// The 1-based lines of a file that are code once its numeric and colour rows are read as data.
export const getNonDataRowLines = (text: string): Set<number> => {
  const dataRowLines = getDataRowLines(text);
  return new Set([...getNonImportLines(text)].filter((line) => !dataRowLines.has(line)));
};
