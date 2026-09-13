import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
// The status column word for each outcome; padded to the widest ("MISSING") so the note column aligns.
export const DiagnosticStatusLabelMap: Record<DiagnosticStatus, string> = {
  [DiagnosticStatus.Missing]: "MISSING",
  [DiagnosticStatus.NotApplicable]: "n/a",
  [DiagnosticStatus.Ok]: "ok",
};
