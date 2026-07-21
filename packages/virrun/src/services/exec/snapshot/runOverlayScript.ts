import { WSL_WORK_TIMEOUT_MS } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
// Cap above the default 1 MB so a large diff's JSON manifest never overflows the buffer.
const OVERLAY_SCRIPT_MAX_BUFFER = 256 * 1024 * 1024;
// Run a Linux-side overlay python program (specs/write-back.md → "Execution locus"): python3 directly on Linux, via
// `wsl.exe --exec python3` on win32 (translating each host path arg to WSL form first). argv array, no shell.
export const runOverlayScript = (script: string, paths: readonly string[], input = ""): string => {
  const isWin32 = process.platform === "win32";
  const scriptArgs = isWin32 ? paths.map((path) => readWslPath(path)) : [...paths];
  const file = isWin32 ? "wsl.exe" : "python3";
  const args = isWin32 ? ["--exec", "python3", "-c", script, ...scriptArgs] : ["-c", script, ...scriptArgs];
  // Bounded like every other WSL-side worker: the copy is real work (minutes for a large diff), but an unbounded
  // ExecFileSync against a wedged WSL service never returns at all, hanging the write-back with no verdict.
  return execFileHidden(file, args, { input, maxBuffer: OVERLAY_SCRIPT_MAX_BUFFER, timeout: WSL_WORK_TIMEOUT_MS });
};
