import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
// The authoritative verdict: the real overlay-mount probe resolveBackend consults. bwrap can be present and new
// Enough yet fail here (unprivileged user namespaces disabled, or nested inside another overlay).
export const probeSandbox = (): DiagnosticCheck => {
  const label = "overlay sandbox mount";
  const type = DiagnosticCheckType.Sandbox;
  return checkIsOsBackendSupported()
    ? { fix: "", label, note: "bubblewrap RAM overlay mounts", status: DiagnosticStatus.Ok, type }
    : {
        fix: "enable unprivileged user namespaces + overlayfs; unavailable when nested inside another overlay",
        label,
        note: "bwrap could not mount the RAM overlay",
        status: DiagnosticStatus.Missing,
        type,
      };
};
