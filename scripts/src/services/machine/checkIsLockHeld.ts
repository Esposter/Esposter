import { checkIsLockFresh } from "#src/services/machine/checkIsLockFresh";
import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import { readLockProcessId } from "#src/services/machine/readLockProcessId";

// Whether a live process holds the lock: the process id it holds, or a fresh lock with none written in yet
export const checkIsLockHeld = (path: string): boolean => {
  const processId = readLockProcessId(path);
  return processId === undefined ? checkIsLockFresh(path) : checkIsWatching(processId, process.pid);
};
