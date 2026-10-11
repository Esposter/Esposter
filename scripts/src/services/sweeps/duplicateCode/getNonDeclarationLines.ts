import { getDeclarationLines } from "#src/services/sweeps/duplicateCode/getDeclarationLines";
import { getNonImportLines } from "#src/services/sweeps/duplicateCode/getNonImportLines";

// The 1-based lines of a file that are code once its declarations and component wiring are read as preamble.
export const getNonDeclarationLines = (text: string): Set<number> => {
  const declarationLines = getDeclarationLines(text);
  return new Set([...getNonImportLines(text)].filter((line) => !declarationLines.has(line)));
};
