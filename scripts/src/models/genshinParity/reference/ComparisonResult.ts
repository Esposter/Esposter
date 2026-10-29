import type { CellReading } from "#src/models/genshinParity/reference/CellReading";
import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

// A comparison's score, for the report, and every cell of its grid, which the command reads its worst cells from
export interface ComparisonResult {
  cells: CellReading[];
  score: ParityScore;
}
