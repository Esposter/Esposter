import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { readSandboxProbeOutput } from "#src/services/cli/doctor/readSandboxProbeOutput";
import { buildWslLoginShellCommand } from "#src/services/exec/wsl/buildWslLoginShellCommand";
// Off win32 the host's own node runs the sandbox, so the check is N/A. On win32 it probes node via the user's real
// WSL login + interactive shell (buildWslLoginShellCommand), matching how readWslLoginEnvironment captures the toolchain the
// Backend can reach — a profile/rc-bound version manager (fnm/nvm) is invisible to a bare `wsl.exe --exec`.
export const probeWslNode = (): DiagnosticCheck => {
  const label = "WSL Linux node";
  const type = DiagnosticCheckType.WslNode;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the host node runs the sandbox",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  const nodePath = readSandboxProbeOutput("sh", ["-c", buildWslLoginShellCommand("command -v node")]) ?? "";
  return nodePath
    ? { fix: "", label, note: nodePath, status: DiagnosticStatus.Ok, type }
    : {
        fix: "install node inside your default WSL2 distro (e.g. via fnm/nvm)",
        label,
        note: "no node in the WSL login shell — node commands can't resolve inside the sandbox",
        status: DiagnosticStatus.Missing,
        type,
      };
};
