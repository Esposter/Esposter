import type { DiagnosticCheck } from "@/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "@/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "@/models/cli/DiagnosticStatus";
import { isVersionAtLeast } from "@/services/cli/isVersionAtLeast";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { PROBE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { buildWslLoginShellCommand } from "@/services/exec/wsl/buildWslLoginShellCommand";
import { getResult, takeOne } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// The oldest bubblewrap exposing `--overlay-src` / `--tmp-overlay` (the RAM-overlay flags the os backend needs).
const MINIMUM_BUBBLEWRAP_VERSION = "0.10.0";
// Resolve a command to where the os backend actually runs it — directly on Linux, or through `wsl.exe --exec` on
// Win32 — so every doctor probe reaches the same place the backend does. Returns the [binary, args] pair to spawn.
const resolveHostCommand = (file: string, args: readonly string[]): [string, string[]] =>
  process.platform === "win32" ? ["wsl.exe", ["--exec", file, ...args]] : [file, [...args]];
// Run a probe command on the host (via resolveHostCommand) and return trimmed stdout, or null when the command is
// Absent or errors (getResult swallows the throw; a missing tool has no partial result to report).
const readProbeOutput = (file: string, args: readonly string[]): null | string =>
  getResult(() =>
    execFileSync(...resolveHostCommand(file, args), { encoding: "utf8", stdio: "pipe", timeout: PROBE_TIMEOUT_MS }),
  )
    .map((stdout) => stdout.trim())
    .unwrapOr(null);

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
    execFileSync(...resolveHostCommand("sh", ["-c", buildWslLoginShellCommand("command -v node")]), {
      encoding: "utf8",
      stdio: "pipe",
      timeout: PROBE_TIMEOUT_MS,
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
// Off win32 the source already lives on the host FS, so no mirror and no rsync — the check is N/A. On win32 the source
// Is synced onto the ext4 mirror (ensureWslSourceMirror) with rsync inside WSL, so a missing rsync aborts every os run.
const probeRsync = (): DiagnosticCheck => {
  const label = "WSL rsync (source mirror)";
  const type = DiagnosticCheckType.Rsync;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the source is read in place, not mirrored",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  const output = readProbeOutput("rsync", ["--version"]);
  return output === null
    ? {
        fix: "install rsync inside your default WSL2 distro (e.g. `sudo apt install -y rsync`)",
        label,
        note: "not found — the repo source can't be mirrored onto ext4, so os runs abort",
        status: DiagnosticStatus.Missing,
        type,
      }
    : { fix: "", label, note: takeOne(output.split("\n"), 0), status: DiagnosticStatus.Ok, type };
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
  probeRsync(),
  probeSandbox(),
];
