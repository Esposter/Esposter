import { getBacktickedTokens } from "#src/services/citations/getBacktickedTokens";
import { UNIT_CELL_REST, UNIT_CELL_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

// The repository paths a unit cell names, in the cell's own grammar: a list of backticked paths, a directory and the
// Entries of it after an em dash, or a directory and the rest after one. A path names its file or its whole tree
export const getUnitPaths = (unit: string): string[] => {
  const [head = "", tail] = unit.split(UNIT_CELL_SEPARATOR);
  const paths = getBacktickedTokens(head);
  if (tail === undefined) return paths;

  const [directory = ""] = paths;
  if (tail.trim() === UNIT_CELL_REST) return [directory];

  return getBacktickedTokens(tail).map((token) => `${directory}/${token}`);
};
