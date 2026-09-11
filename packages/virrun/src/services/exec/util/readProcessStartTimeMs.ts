import { PROCESS_START_PROBE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { parseProcStatStartTicks } from "#src/services/exec/util/parseProcStatStartTicks";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// /proc reports a process's start in USER_HZ ticks since boot, and USER_HZ is fixed at 100 for /proc whatever HZ the
// Kernel was built with, so the constant is the interface rather than a guess at the build
const PROC_TICKS_PER_SECOND = 100;
const PROC_BOOT_TIME_REGEX = /^btime (?<seconds>\d+)$/mu;

const readLinuxStartTimeMs = (pid: number): number => {
  const bootSeconds = Number(PROC_BOOT_TIME_REGEX.exec(readFileSync("/proc/stat", "utf8"))?.groups?.seconds);
  const ticks = parseProcStatStartTicks(readFileSync(`/proc/${pid.toString()}/stat`, "utf8"));
  return bootSeconds * 1000 + (ticks * 1000) / PROC_TICKS_PER_SECOND;
};

// Windows PowerShell rather than pwsh, because it is on every host. This is the one shell virrun spawns for a fact
// Node has no API for, and it is spawned only for a live pid that is not this process's own — a concurrent run.
const readWindowsStartTimeMs = (pid: number): number =>
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

// When the process holding `pid` started, as epoch milliseconds — or undefined where the platform has no way to say,
// The process is gone, or it belongs to a user whose processes this one may not read. Every caller treats undefined
// As "no identity to check", never as an answer.
export const readProcessStartTimeMs = (pid: number): number | undefined =>
  getResult(() => {
    if (process.platform === "win32") return readWindowsStartTimeMs(pid);
    if (process.platform === "linux") return readLinuxStartTimeMs(pid);
    return Number.NaN;
  })
    .map((startTimeMs) => (Number.isFinite(startTimeMs) ? startTimeMs : undefined))
    .unwrapOr(undefined);
