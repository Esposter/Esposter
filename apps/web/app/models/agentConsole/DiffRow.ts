import type { DiffRowType } from "@/models/agentConsole/DiffRowType";

// One row of a side-by-side diff: the line on each side, empty on the side a line was added to or removed from. A
// Side with no line has a line number of 0, and a folded run has none on either side
export interface DiffRow {
  newLine: string;
  newLineNumber: number;
  oldLine: string;
  oldLineNumber: number;
  type: DiffRowType;
}
