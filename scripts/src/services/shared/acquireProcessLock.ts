import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { tryCreateLock } from "#src/services/shared/tryCreateLock";
import { getResult, noop } from "@esposter/shared";
import { linkSync, mkdirSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
import { uptime } from "node:os";
import { dirname } from "node:path";

// Takes a lock for this process, or returns False while a live process holds it. A lock whose process is gone was left
// By a holder that died, and one written before the machine last booted names a process id the boot may have handed to
// Another process since, so either is taken over. An empty lock is one whose holder is still writing it
export const acquireProcessLock = (lockPath: string): boolean => {
  mkdirSync(dirname(lockPath), { recursive: true });
  if (tryCreateLock(lockPath)) return true;
  const holder = getResult(() => readFileSync(lockPath, "utf8")).match(
    (text) => text,
    () => "",
  );
  const lockStats = getResult(() => statSync(lockPath)).match(
    (stats) => stats,
    () => undefined,
  );
  const bootMilliseconds =
    Temporal.Now.instant().epochMilliseconds -
    Temporal.Duration.from({ seconds: Math.ceil(uptime()) }).total("milliseconds");
  const isFromBeforeBoot = lockStats !== undefined && lockStats.mtimeMs < bootMilliseconds;
  if (!isFromBeforeBoot && (holder === "" || checkIsProcessRunning(Number(holder)))) return false;
  if (lockStats === undefined) return tryCreateLock(lockPath);
  // Two processes can judge one lock stale together, and the first may take it over before the second removes it, so the
  // Lock is moved aside rather than removed. A lock moved aside that is not the one judged stale is another process's
  // Since, and is put back, unless a third has taken the lock meanwhile
  const stalePath = `${lockPath}.${process.pid}.stale`;
  const isMoved = getResult(() => renameSync(lockPath, stalePath)).match(
    () => true,
    () => false,
  );
  if (!isMoved) return tryCreateLock(lockPath);
  const isJudgedLock = getResult(() => statSync(stalePath).ino === lockStats.ino).match(
    (value) => value,
    () => false,
  );
  // A failed link is a lock taken meanwhile, which stands, so the holder of the lock moved aside no longer holds it
  if (!isJudgedLock)
    getResult(() => linkSync(stalePath, lockPath)).match(noop, (error) => {
      console.error(`${lockPath} was taken while it was moved aside, so its holder lost it: ${error.message}`);
    });
  rmSync(stalePath, { force: true });
  return isJudgedLock && tryCreateLock(lockPath);
};
