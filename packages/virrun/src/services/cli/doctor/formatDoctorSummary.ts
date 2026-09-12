import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { Color } from "#src/models/cli/Color";
import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunError } from "#src/services/cli/format/formatVirrunError";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// The one-line verdict. A failed Sandbox check means resolveBackend degrades os → native (the true fallback); any
// Other failure means the sandbox mounts but a command hits a toolchain/write-back gap — kept distinct because the
// Two failures have genuinely different consequences (apps/web/content/docs/virrun/adoption.md auto-fallback).
export const formatDoctorSummary = (checks: readonly DiagnosticCheck[]): string => {
  const isSandboxMissing = checks.some(
    (check) => check.type === DiagnosticCheckType.Sandbox && check.status === DiagnosticStatus.Missing,
  );
  if (isSandboxMissing) return formatVirrunError("os backend unavailable — commands fall back to native (un-isolated)");
  else if (checks.every((check) => check.status !== DiagnosticStatus.Missing))
    return formatVirrunLine(colorize("os backend ready — `virrun -- <cmd>` runs sandboxed", Color.Green));
  else
    return formatVirrunLine(
      colorize("os backend mounts, but some commands will fail — see the checks above", Color.Yellow),
    );
};
