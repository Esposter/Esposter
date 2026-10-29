import type { CellReading } from "#src/models/genshinParity/reference/CellReading";

// The cells with the largest errors, worst first, cut to the count asked for: where the two images differ most
export const getWorstCells = (cells: readonly CellReading[], count: number): CellReading[] =>
  cells.toSorted((first, second) => second.error - first.error).slice(0, count);
