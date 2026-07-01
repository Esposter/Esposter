import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
// 0 when every applicable prerequisite is satisfied, else 1 — so `virrun doctor` is scriptable as a gate. A
// NotApplicable check (e.g. the WSL node check off win32) never fails the run.
export const getDoctorExitCode = (checks: readonly DiagnosticCheck[]): number =>
  checks.every((check) => check.status !== DiagnosticStatus.Missing) ? 0 : 1;
