import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
// The status column word for each outcome; padded to the widest ("MISSING") so the note column aligns.
const STATUS_LABEL_MAP = {
  [DiagnosticStatus.Missing]: "MISSING",
  [DiagnosticStatus.NotApplicable]: "n/a",
  [DiagnosticStatus.Ok]: "ok",
} as const satisfies Record<DiagnosticStatus, string>;
const STATUS_COLUMN_WIDTH = STATUS_LABEL_MAP[DiagnosticStatus.Missing].length;
// One report row; a Missing check appends its remediation on an indented follow-up line.
const formatCheckLine = (check: DiagnosticCheck, labelWidth: number): string => {
  const head = `  ${check.label.padEnd(labelWidth)}  ${STATUS_LABEL_MAP[check.status].padEnd(STATUS_COLUMN_WIDTH)}  ${check.note}`;
  return check.status === DiagnosticStatus.Missing ? `${head}\n      → ${check.fix}` : head;
};
// The one-line verdict. A failed Sandbox check means resolveBackend degrades os → native (the true fallback); any
// Other failure means the sandbox mounts but a command hits a toolchain/write-back gap — kept distinct because the
// Two failures have genuinely different consequences (specs/adoption.md auto-fallback).
const formatSummary = (checks: readonly DiagnosticCheck[]): string => {
  const isSandboxMissing = checks.some(
    (check) => check.type === DiagnosticCheckType.Sandbox && check.status === DiagnosticStatus.Missing,
  );
  if (isSandboxMissing) return "[virrun] os backend unavailable — commands fall back to native (un-isolated)";
  else if (checks.every((check) => check.status !== DiagnosticStatus.Missing))
    return "[virrun] os backend ready — `virrun -- <cmd>` runs sandboxed";
  else return "[virrun] os backend mounts, but some commands will fail — see the checks above";
};
// Renders the doctor report: a platform-stamped header, one aligned row per check, and the verdict. Pure over
// Already-probed checks so the IO stays in probeOsBackendChecks and the layout is unit-tested.
export const formatDoctorReport = ({
  checks,
  platform,
}: {
  checks: readonly DiagnosticCheck[];
  platform: string;
}): string => {
  const labelWidth = Math.max(...checks.map((check) => check.label.length));
  const lines = checks.map((check) => formatCheckLine(check, labelWidth));
  return [`[virrun] doctor — os backend prerequisites (${platform})`, ...lines, formatSummary(checks)].join("\n");
};
