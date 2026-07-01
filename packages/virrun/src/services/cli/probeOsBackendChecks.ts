import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
import { isVersionAtLeast } from "@/services/cli/isVersionAtLeast";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import process from "node:process";
// The oldest bubblewrap exposing `--overlay-src` / `--tmp-overlay` (the RAM-overlay flags the os backend needs).
const MINIMUM_BUBBLEWRAP_VERSION = "0.10.0";
// Run a probe command the same place the os backend runs it — directly on Linux, via `wsl.exe --exec` on win32 — so
// The doctor's verdict matches the backend's real reach. Returns trimmed stdout, or null when the command is absent
// Or errors (getResult swallows the throw; a missing tool has no partial result to report).
const readProbeOutput = (file: string, args: readonly string[]): null | string => {
  const isWin32 = process.platform === "win32";
  return getResult(() =>
    execFileSync(isWin32 ? "wsl.exe" : file, isWin32 ? ["--exec", file, ...args] : [...args], {
      encoding: "utf8",
      stdio: "pipe",
    }),
  )
    .map((stdout) => stdout.trim())
    .unwrapOr(null);
};

const probeBubblewrap = (): DiagnosticCheck => {
  const label = `bubblewrap >= ${MINIMUM_BUBBLEWRAP_VERSION}`;
  const type = DiagnosticCheckType.Bubblewrap;
  const output = readProbeOutput("bwrap", ["--version"]);
  if (output === null)
    return {
      fix: "install bubblewrap (e.g. `sudo apt install -y bubblewrap`)",
      label,
      note: "not found on PATH",
      status: DiagnosticStatus.Missing,
      type,
    };
  if (isVersionAtLeast(output, MINIMUM_BUBBLEWRAP_VERSION))
    return { fix: "", label, note: output, status: DiagnosticStatus.Ok, type };
  return {
    fix: `upgrade bubblewrap to >= ${MINIMUM_BUBBLEWRAP_VERSION} for RAM-overlay support`,
    label,
    note: `${output} is too old`,
    status: DiagnosticStatus.Missing,
    type,
  };
};
// Off win32 the host's own node runs the sandbox, so the check is N/A. On win32 it probes node via the user's real
// WSL login + interactive shell (buildWslLoginShellCommand), matching how readWslLoginPath captures the toolchain the
// Backend can reach — a profile/rc-bound version manager (fnm/nvm) is invisible to a bare `wsl.exe --exec`.
const probeWslNode = (): DiagnosticCheck => {
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
  const nodePath = getResult(() =>
    execFileSync("wsl.exe", ["--exec", "sh", "-c", buildWslLoginShellCommand("command -v node")], {
      encoding: "utf8",
      stdio: "pipe",
    }),
  )
    .map((stdout) => stdout.trim())
    .unwrapOr("");
  return nodePath === ""
    ? {
        fix: "install node inside your default WSL2 distro (e.g. via fnm/nvm)",
        label,
        note: "no node in the WSL login shell — node commands can't resolve inside the sandbox",
        status: DiagnosticStatus.Missing,
        type,
      }
    : { fix: "", label, note: nodePath, status: DiagnosticStatus.Ok, type };
};

const probePython3 = (): DiagnosticCheck => {
  const label = "python3 (write-back)";
  const type = DiagnosticCheckType.Python3;
  const output = readProbeOutput("python3", ["--version"]);
  return output === null
    ? {
        fix: "install python3 (used only to flush produced files to host on `virrun -- <cmd>`)",
        label,
        note: "not found — write-back (persist) can't reconcile produced files",
        status: DiagnosticStatus.Missing,
        type,
      }
    : { fix: "", label, note: output, status: DiagnosticStatus.Ok, type };
};
// The authoritative verdict: the real overlay-mount probe resolveBackend consults. bwrap can be present and new
// Enough yet fail here (unprivileged user namespaces disabled, or nested inside another overlay).
const probeSandbox = (): DiagnosticCheck => {
  const label = "overlay sandbox mount";
  const type = DiagnosticCheckType.Sandbox;
  return isOsBackendSupported()
    ? { fix: "", label, note: "bubblewrap RAM overlay mounts", status: DiagnosticStatus.Ok, type }
    : {
        fix: "enable unprivileged user namespaces + overlayfs; unavailable when nested inside another overlay",
        label,
        note: "bwrap could not mount the RAM overlay",
        status: DiagnosticStatus.Missing,
        type,
      };
};
// Probes every os-backend prerequisite (IO). Ordered cause → effect: the three components first, then the
// Authoritative overlay-mount verdict they feed.
export const probeOsBackendChecks = (): DiagnosticCheck[] => [
  probeBubblewrap(),
  probeWslNode(),
  probePython3(),
  probeSandbox(),
];
