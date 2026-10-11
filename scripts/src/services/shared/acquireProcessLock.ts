import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { PROCESS_LOCK_WRITE_GRACE_MILLISECONDS } from "#src/services/shared/constants";
import { tryCreateLock } from "#src/services/shared/tryCreateLock";
import { getResult } from "@esposter/shared";
import { closeSync, fstatSync, mkdirSync, openSync, readFileSync, rmSync } from "node:fs";
import { uptime } from "node:os";
import { dirname } from "node:path";

// Whether a lock was left by a holder that is gone: one whose process is gone, one written before the machine last
// Booted, since the boot may have handed its process id to another process, and an empty one past the grace its writer
// Has to write it in. Its holder and its time are read through one open file, so both are the same lock's, and a lock
// That is not there is held by nothing
const checkIsStale = (lockPath: string): boolean =>
  getResult(() => openSync(lockPath, "r")).match(
    (fileDescriptor) => {
      const isStale = getResult(() => {
        const holder = readFileSync(fileDescriptor, "utf8");
        const { mtimeMs } = fstatSync(fileDescriptor);
        const nowMilliseconds = Temporal.Now.instant().epochMilliseconds;
        const bootMilliseconds =
          nowMilliseconds - Temporal.Duration.from({ seconds: Math.ceil(uptime()) }).total("milliseconds");
        if (mtimeMs < bootMilliseconds) return true;
        return holder === ""
          ? nowMilliseconds - mtimeMs > PROCESS_LOCK_WRITE_GRACE_MILLISECONDS
          : !checkIsProcessRunning(Number(holder));
      }).match(
        (value) => value,
        () => false,
      );
      closeSync(fileDescriptor);
      return isStale;
    },
    () => true,
  );

// Takes a lock for this process, or returns False while a live process holds it or another takes it over. A stale lock
// Is judged and replaced only by the one process holding its takeover file, so no taker moves or removes a lock another
// Has just taken, and the lock is recreated exclusively, so a process finding it gone in between takes it instead. A
// Takeover file outlives its taker only when the taker died inside the few calls it holds it for, and is judged stale
// As a lock is; removing such a file is the one step two takers can race through
export const acquireProcessLock = (lockPath: string): boolean => {
  mkdirSync(dirname(lockPath), { recursive: true });
  if (tryCreateLock(lockPath)) return true;
  const takeoverPath = `${lockPath}.takeover`;
  if (!tryCreateLock(takeoverPath)) {
    if (!checkIsStale(takeoverPath)) return false;
    rmSync(takeoverPath, { force: true });
    if (!tryCreateLock(takeoverPath)) return false;
  }
  const isStale = checkIsStale(lockPath);
  if (isStale) rmSync(lockPath, { force: true });
  const isTaken = isStale && tryCreateLock(lockPath);
  rmSync(takeoverPath, { force: true });
  return isTaken;
};
