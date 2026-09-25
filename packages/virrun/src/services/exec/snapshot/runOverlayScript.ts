import { EXEC_FILE_MAX_BUFFER, OVERLAY_WRITE_BACK_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { execWsl } from "#src/services/exec/wsl/execWsl";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
// Run a Linux-side overlay python program (apps/web/content/docs/virrun/write-back.md, "Execution locus"): python3
// Directly on Linux, via `wsl.exe --exec python3` on win32 (translating each host path arg to WSL form first). argv
// Array, no shell.
export const runOverlayScript = (script: string, paths: readonly string[], input = ""): string => {
  // Bounded like every other WSL-side worker, but on its own data-proportional cap: the copy is the run's whole
  // Diff, so the work cap sized for one cache entry would SIGTERM a large write-back partway and fail a command
  // That succeeded. An unbounded execFileSync against a wedged WSL service never returns at all, hanging the
  // Write-back with no verdict — see apps/web/content/docs/virrun/subprocess-timeouts.md.
  const options = { input, maxBuffer: EXEC_FILE_MAX_BUFFER, timeout: OVERLAY_WRITE_BACK_TIMEOUT_MS };
  if (process.platform === "win32") {
    const wslPaths = paths.map((path) => readWslPath(path));
    return execWsl(["--exec", "python3", "-c", script, ...wslPaths], options);
  } else return execFileHidden("python3", ["-c", script, ...paths], options);
};
