import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { Color } from "#src/models/cli/Color";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { colorize } from "#src/services/cli/color/colorize";
import { DiagnosticStatusColorMap } from "#src/services/cli/doctor/DiagnosticStatusColorMap";
import { DiagnosticStatusLabelMap } from "#src/services/cli/doctor/DiagnosticStatusLabelMap";

const STATUS_COLUMN_WIDTH = DiagnosticStatusLabelMap[DiagnosticStatus.Missing].length;
// One report row; a Missing check appends its remediation on an indented follow-up line. The status word is colored
// But padded on its plain length so the note column stays aligned whether or not color is on.
export const formatCheckLine = (check: DiagnosticCheck, labelWidth: number): string => {
  const statusWord = DiagnosticStatusLabelMap[check.status];
  const statusCell = `${colorize(statusWord, DiagnosticStatusColorMap[check.status])}${" ".repeat(STATUS_COLUMN_WIDTH - statusWord.length)}`;
  const head = `  ${check.label.padEnd(labelWidth)}  ${statusCell}  ${colorize(check.note, Color.Dim)}`;
  return check.status === DiagnosticStatus.Missing ? `${head}\n      ${colorize(`→ ${check.fix}`, Color.Red)}` : head;
};
