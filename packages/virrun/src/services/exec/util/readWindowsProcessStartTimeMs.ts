import { PROCESS_START_PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileSync } from "node:child_process";
// Windows PowerShell rather than pwsh, because it is on every host. This is the one shell virrun spawns for a fact
// Node has no API for, and it is spawned only for a live pid that is not this process's own — a concurrent run.
export const readWindowsProcessStartTimeMs = (pid: number): number =>
  Date.parse(
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `(Get-Process -Id ${pid.toString()} -ErrorAction Stop).StartTime.ToUniversalTime().ToString('o')`,
      ],
      // A pid nothing holds is an error PowerShell prints; the throw is the answer, not the text
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: PROCESS_START_PROBE_TIMEOUT_MS,
        windowsHide: true,
      },
    ).trim(),
  );
