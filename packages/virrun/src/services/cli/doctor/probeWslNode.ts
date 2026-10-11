import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { readSandboxProbeOutput } from "#src/services/cli/doctor/readSandboxProbeOutput";
import { buildWslLoginShellCommand } from "#src/services/exec/wsl/buildWslLoginShellCommand";

// Off win32 the host's own toolchain runs the sandbox, so the check is N/A. On win32 it probes node and pnpm via the
// User's real WSL login + interactive shell (buildWslLoginShellCommand), matching how readWslLoginEnvironment captures
// The toolchain the backend can reach — a profile/rc-bound version manager is invisible to a bare `wsl.exe --exec`.
// Both are required: the snapshot installs with the `pnpm` that shell resolves, and every command runs on its `node`.
export const probeWslNode = (): DiagnosticCheck => {
  const label = "WSL Linux node + pnpm";
  const type = DiagnosticCheckType.WslNode;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the host toolchain runs the sandbox",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  const nodePath =
    readSandboxProbeOutput("sh", ["-c", buildWslLoginShellCommand("command -v pnpm > /dev/null && command -v node")]) ??
    "";
  return nodePath
    ? { fix: "", label, note: nodePath, status: DiagnosticStatus.Ok, type }
    : {
        fix: "install the node and pnpm the repo pins inside your default WSL2 distro (e.g. `vp env install`)",
        label,
        note: "no node or pnpm in the WSL login shell — the sandbox can't install or run node commands",
        status: DiagnosticStatus.Missing,
        type,
      };
};
