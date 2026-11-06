// Row 0 is the northernmost band and column 0 the westernmost, each cell a `1 / cellsPerDegree` degree square.
// A row lists its land as runs, `[startColumn, endColumn, ...]` with each end exclusive
export interface LandMask {
  cellsPerDegree: number;
  rows: number[][];
}
