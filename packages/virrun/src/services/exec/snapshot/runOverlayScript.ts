import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { execFileSync } from "node:child_process";
// A manifest of a large build (thousands of files) is still small as JSON, but cap generously so a big diff never
// Trips the default 1 MB execFileSync buffer.
const OVERLAY_SCRIPT_MAX_BUFFER = 256 * 1024 * 1024;
// Run one of the Linux-side overlay python programs (OVERLAY_PROBE_SCRIPT / OVERLAY_APPLY_SCRIPT) — the only part of
// Write-back that must execute Linux-side, because a Windows host cannot read overlay char-device whiteouts or
// user.overlay.* xattrs over the \\wsl.localhost 9p bridge (specs/write-back.md). On Linux it invokes python3
// Directly; on win32 it bridges through `wsl.exe --exec python3`, translating each host path argument to its WSL
// Form first (the upper + snapshot live on WSL ext4, the host working dir on /mnt/c). `input` carries the flush
// Plan for the apply program; the return value is the probe's JSON manifest. argv array (no shell) so paths and the
// Script body are never reinterpreted by a host shell.
export const runOverlayScript = (script: string, paths: readonly string[], input = ""): string => {
  const isWin32 = process.platform === "win32";
  const scriptArgs = isWin32 ? paths.map(readWslPath) : [...paths];
  const file = isWin32 ? "wsl.exe" : "python3";
  const args = isWin32 ? ["--exec", "python3", "-c", script, ...scriptArgs] : ["-c", script, ...scriptArgs];
  return execFileSync(file, args, { encoding: "utf8", input, maxBuffer: OVERLAY_SCRIPT_MAX_BUFFER });
};
