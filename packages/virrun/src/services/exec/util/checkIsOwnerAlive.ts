import { checkIsProcessAlive } from "#src/services/exec/util/checkIsProcessAlive";
import { OWNER_START_TOLERANCE_MS } from "#src/services/exec/util/constants";
import { readProcessStartTimeMs } from "#src/services/exec/util/readProcessStartTimeMs";
import { getResult } from "@esposter/shared";
import { statSync } from "node:fs";
// A pid-tagged entry names its owner by pid alone, and the OS hands a dead process's pid to the next one it starts, so
// "The pid is alive" only means "some process holds it". What tells the owner from a successor is when it started:
// The owner was running when it wrote the entry, so it started before the entry's mtime, while any process that
// Inherited the pid started after the owner exited — after every write the owner made. An alive pid whose start is
// Later than the entry is therefore a stranger, and the entry is the corpse it looks like.
//
// This process's own entries skip the probe — it is the owner by construction, and the win32 probe is a PowerShell
// Spawn. An entry that cannot be stat'ed or a start time the platform cannot read keeps the old answer, alive is
// Live, so an unreadable identity errs toward sparing a run for one more sweep rather than killing one.
export const checkIsOwnerAlive = (pid: number, entryPath: string): boolean => {
  if (!checkIsProcessAlive(pid)) return false;
  if (pid === process.pid) return true;

  const mtimeMs = getResult(() => statSync(entryPath).mtimeMs).unwrapOr(undefined);
  if (mtimeMs === undefined) return true;

  const startTimeMs = readProcessStartTimeMs(pid);
  return startTimeMs === undefined || startTimeMs <= mtimeMs + OWNER_START_TOLERANCE_MS;
};
