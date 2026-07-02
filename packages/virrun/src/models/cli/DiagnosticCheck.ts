import type { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import type { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
// One row of the `virrun doctor` report: an os-backend prerequisite, its outcome, and — when unsatisfied — how to fix it.
export interface DiagnosticCheck {
  // The remediation, shown indented under the check when its status is Missing.
  fix: string;
  // Human label for the check, e.g. "bubblewrap >= 0.10.0".
  label: string;
  // When Ok, the discovered detail (version/path); when Missing, the consequence of its absence.
  note: string;
  status: DiagnosticStatus;
  type: DiagnosticCheckType;
}
