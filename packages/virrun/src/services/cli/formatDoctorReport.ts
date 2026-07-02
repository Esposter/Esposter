import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { Color } from "@/models/cli/Color";
import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
import { colorize } from "@/services/cli/colorize";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// The status column word for each outcome; padded to the widest ("MISSING") so the note column aligns.
const STATUS_LABEL_MAP = {
  [DiagnosticStatus.Missing]: "MISSING",
  [DiagnosticStatus.NotApplicable]: "n/a",
  [DiagnosticStatus.Ok]: "ok",
} as const satisfies Record<DiagnosticStatus, string>;
// The Color per outcome — green ok, red MISSING, dim n/a — so the status column is scannable as a pass/fail traffic
// Light. Keyed off the enum so a new status is a compile error here, not a silently uncolored row.
const STATUS_COLOR_MAP = {
  [DiagnosticStatus.Missing]: Color.Red,
  [DiagnosticStatus.NotApplicable]: Color.Dim,
  [DiagnosticStatus.Ok]: Color.Green,
} as const satisfies Record<DiagnosticStatus, Color>;
const STATUS_COLUMN_WIDTH = STATUS_LABEL_MAP[DiagnosticStatus.Missing].length;
// One report row; a Missing check appends its remediation on an indented follow-up line. The status word is colored
// But padded on its plain length so the note column stays aligned whether or not color is on.
const formatCheckLine = (check: DiagnosticCheck, labelWidth: number): string => {
  const statusWord = STATUS_LABEL_MAP[check.status];
  const statusCell = `${colorize(statusWord, STATUS_COLOR_MAP[check.status])}${" ".repeat(STATUS_COLUMN_WIDTH - statusWord.length)}`;
  const head = `  ${check.label.padEnd(labelWidth)}  ${statusCell}  ${colorize(check.note, Color.Dim)}`;
  return check.status === DiagnosticStatus.Missing ? `${head}\n      ${colorize(`→ ${check.fix}`, Color.Red)}` : head;
};
// The one-line verdict. A failed Sandbox check means resolveBackend degrades os → native (the true fallback); any
// Other failure means the sandbox mounts but a command hits a toolchain/write-back gap — kept distinct because the
// Two failures have genuinely different consequences (specs/adoption.md auto-fallback).
const formatSummary = (checks: readonly DiagnosticCheck[]): string => {
  const isSandboxMissing = checks.some(
    (check) => check.type === DiagnosticCheckType.Sandbox && check.status === DiagnosticStatus.Missing,
  );
  if (isSandboxMissing)
    return formatVirrunLine(colorize("os backend unavailable — commands fall back to native (un-isolated)", Color.Red));
  else if (checks.every((check) => check.status !== DiagnosticStatus.Missing))
    return formatVirrunLine(colorize("os backend ready — `virrun -- <cmd>` runs sandboxed", Color.Green));
  else
    return formatVirrunLine(
      colorize("os backend mounts, but some commands will fail — see the checks above", Color.Yellow),
    );
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
  const header = formatVirrunLine(`doctor — os backend prerequisites (${colorize(platform, Color.Blue)})`);
  return [header, ...lines, formatSummary(checks)].join("\n");
};
