import { UNIT_CELL_REST, UNIT_CELL_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";

const BACKTICKED_REGEX = /`(?<text>[^`]+)`/gu;

// The repository paths a unit cell names, in the cell's own grammar: a list of backticked paths, a directory and the
// Entries of it after an em dash, or a directory and the rest after one. A path names its file or its whole tree
export const getUnitPaths = (unit: string): string[] => {
  const [head = "", tail] = unit.split(UNIT_CELL_SEPARATOR);
  const paths = Array.from(head.matchAll(BACKTICKED_REGEX), ({ groups }) => groups?.text ?? "");
  if (tail === undefined) return paths;

  const [directory = ""] = paths;
  if (tail.trim() === UNIT_CELL_REST) return [directory];

  return Array.from(tail.matchAll(BACKTICKED_REGEX), ({ groups }) => `${directory}/${groups?.text ?? ""}`);
};
