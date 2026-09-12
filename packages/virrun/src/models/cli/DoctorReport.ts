import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

export interface DoctorReport {
  checks: readonly DiagnosticCheck[];
  platform: string;
}
