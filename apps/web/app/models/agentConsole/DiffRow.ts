import type { DiffRowType } from "@/models/agentConsole/DiffRowType";

// One row of a side-by-side diff: the line on each side, empty on the side a line was added to or removed from
export interface DiffRow {
  newLine: string;
  oldLine: string;
  type: DiffRowType;
}
