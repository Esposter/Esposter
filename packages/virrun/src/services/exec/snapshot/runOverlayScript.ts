import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { execFileSync } from "node:child_process";
// Cap above the default 1 MB so a large diff's JSON manifest never overflows the buffer.
const OVERLAY_SCRIPT_MAX_BUFFER = 256 * 1024 * 1024;
// Run a Linux-side overlay python program (specs/write-back.md → "Execution locus"): python3 directly on Linux, via
// `wsl.exe --exec python3` on win32 (translating each host path arg to WSL form first). argv array, no shell.
export const runOverlayScript = (script: string, paths: readonly string[], input = ""): string => {
  const isWin32 = process.platform === "win32";
  const scriptArgs = isWin32 ? paths.map((path) => readWslPath(path)) : [...paths];
  const file = isWin32 ? "wsl.exe" : "python3";
  const args = isWin32 ? ["--exec", "python3", "-c", script, ...scriptArgs] : ["-c", script, ...scriptArgs];
  return execFileSync(file, args, { encoding: "utf8", input, maxBuffer: OVERLAY_SCRIPT_MAX_BUFFER });
};
