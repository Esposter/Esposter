import { parseProcStatStartTicks } from "#src/services/exec/util/parseProcStatStartTicks";
import { readFileSync } from "node:fs";
// /proc reports a process's start in USER_HZ ticks since boot, and USER_HZ is fixed at 100 for /proc whatever HZ the
// Kernel was built with, so the constant is the interface rather than a guess at the build
const PROC_TICKS_PER_SECOND = 100;
const PROC_BOOT_TIME_REGEX = /^btime (?<seconds>\d+)$/mu;

export const readLinuxProcessStartTimeMs = (pid: number): number => {
  const bootSeconds = Number(PROC_BOOT_TIME_REGEX.exec(readFileSync("/proc/stat", "utf8"))?.groups?.seconds);
  const ticks = parseProcStatStartTicks(readFileSync(`/proc/${pid.toString()}/stat`, "utf8"));
  return bootSeconds * 1000 + (ticks * 1000) / PROC_TICKS_PER_SECOND;
};
