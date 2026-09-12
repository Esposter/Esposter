import { Color } from "#src/models/cli/Color";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
// The Color per outcome — green ok, red MISSING, dim n/a — so the status column is scannable as a pass/fail traffic
// Light. Keyed off the enum so a new status is a compile error here, not a silently uncolored row.
export const DiagnosticStatusColorMap: Record<DiagnosticStatus, Color> = {
  [DiagnosticStatus.Missing]: Color.Red,
  [DiagnosticStatus.NotApplicable]: Color.Dim,
  [DiagnosticStatus.Ok]: Color.Green,
};
