import { readLinuxProcessStartTimeMs } from "#src/services/exec/util/readLinuxProcessStartTimeMs";
import { readWindowsProcessStartTimeMs } from "#src/services/exec/util/readWindowsProcessStartTimeMs";
import { getResult } from "@esposter/shared";
// When the process holding `pid` started, as epoch milliseconds — or undefined where the platform has no way to say,
// The process is gone, or it belongs to a user whose processes this one may not read. Every caller treats undefined
// As "no identity to check", never as an answer.
export const readProcessStartTimeMs = (pid: number): number | undefined =>
  getResult(() => {
    if (process.platform === "win32") return readWindowsProcessStartTimeMs(pid);
    if (process.platform === "linux") return readLinuxProcessStartTimeMs(pid);
    return Number.NaN;
  })
    .map((startTimeMs) => (Number.isFinite(startTimeMs) ? startTimeMs : undefined))
    .unwrapOr(undefined);
