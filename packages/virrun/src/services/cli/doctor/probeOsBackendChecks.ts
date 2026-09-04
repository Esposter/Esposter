import type { DiagnosticCheck } from "#src/models/cli/DiagnosticCheck";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { DiagnosticStatus } from "#src/models/cli/DiagnosticStatus";
import { checkIsVersionAtLeast } from "#src/services/cli/run/checkIsVersionAtLeast";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { getTarExecutable } from "#src/services/exec/util/getTarExecutable";
import { buildWslLoginShellCommand } from "#src/services/exec/wsl/buildWslLoginShellCommand";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { getResult, takeOne } from "@esposter/shared";
// The oldest bubblewrap exposing `--overlay-src` / `--tmp-overlay` (the RAM-overlay flags the os backend needs).
const MINIMUM_BUBBLEWRAP_VERSION = "0.10.0";
// Run a probe command where the os backend actually runs it — directly on Linux, or through `wsl.exe --exec` on
// Win32 — so every doctor probe reaches the same place the backend does, and returns trimmed stdout, or null when
// The command is absent or errors (getResult swallows the throw; a missing tool has no partial result to report).
// The win32 side goes through execWsl rather than spawning wsl.exe here, so it inherits the cold-boot-tolerant WSL
// Bound: reporting `not found on PATH` for a tool that was only waiting on the distro to boot is the same wrong
// Answer the capability probe used to cache.
const readProbeOutput = (file: string, args: readonly string[]): null | string =>
  getResult(() =>
    process.platform === "win32"
      ? execWsl(["--exec", file, ...args])
      : execFileHidden(file, args, { timeout: PROBE_TIMEOUT_MS }),
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
  if (checkIsVersionAtLeast(output, MINIMUM_BUBBLEWRAP_VERSION))
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
// WSL login + interactive shell (buildWslLoginShellCommand), matching how readWslLoginEnvironment captures the toolchain the
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
  const nodePath = readProbeOutput("sh", ["-c", buildWslLoginShellCommand("command -v node")]) ?? "";
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
// Off win32 the source already lives on the host FS, so no mirror and no archive — the check is N/A. On win32 the
// Source is synced onto the ext4 mirror through a tar archive staged by the HOST tar (createSourceMirrorArchive) —
// Probed directly on Windows, never through readProbeOutput, because that is where it runs — so a missing tar.exe
// Aborts every os run that has a delta to apply. The extract side inside WSL needs no probe: GNU tar is an essential
// Package in every distro, unlike the rsync this replaced.
const probeTar = (): DiagnosticCheck => {
  const label = "host tar (source mirror)";
  const type = DiagnosticCheckType.Tar;
  if (process.platform !== "win32")
    return {
      fix: "",
      label,
      note: "not needed off win32 — the source is read in place, not mirrored",
      status: DiagnosticStatus.NotApplicable,
      type,
    };
  const output = getResult(() => execFileHidden(getTarExecutable(), ["--version"], { timeout: PROBE_TIMEOUT_MS }))
    .map((stdout) => stdout.trim())
    .unwrapOr(null);
  return output === null
    ? {
        fix: "install Windows tar (bsdtar ships with Windows 10 1803+ at System32\\tar.exe; check PATH)",
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
// Probes every os-backend prerequisite (IO). Ordered cause → effect: the three components first, then the
// Authoritative overlay-mount verdict they feed.
export const probeOsBackendChecks = (): DiagnosticCheck[] => [
  probeBubblewrap(),
  probeWslNode(),
  probePython3(),
  probeTar(),
  probeSandbox(),
];
