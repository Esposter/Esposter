import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { getRowPass } from "#src/services/genshinParity/passes/getRowPass";

// A report row's cells between its bars, trimmed, so an empty cell keeps its place
const readRowCells = (row: string): string[] =>
  row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
// The first reading a run would rewrite under a gate other than the one its report holds for it: a recorded row of the
// Same pass and reading whose gate cell is another. A gate is a threshold the reference's own noise sets, so one that
// Moves means the exports or the camera it is read through moved, and the run names it rather than rewriting it silently
export const findMovedGate = ({
  recordedRows,
  results,
}: {
  recordedRows: readonly string[];
  results: readonly ParityPassResult[];
}): { measured: string; name: string; pass: ParityPass; recorded: string } | undefined => {
  for (const { measure, pass } of results)
    for (const { gate, name } of measure.readings) {
      const row = recordedRows.find(
        (recordedRow) => getRowPass(recordedRow) === pass && readRowCells(recordedRow)[1] === name,
      );
      if (!row) continue;
      const recorded = readRowCells(row)[3] ?? "";
      const measured = formatPassValue(gate);
      if (recorded !== measured) return { measured, name, pass, recorded };
    }
  return undefined;
};
