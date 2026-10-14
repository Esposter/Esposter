import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import {
  EMPTY_LOCK_GRACE_MILLISECONDS,
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult, noop } from "@esposter/shared";
import { linkSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";

// Create-only, so of two starters exactly one gets the file, however close together they start
const createLock = (path: string): boolean =>
  getResult(() => writeFileSync(path, `${process.pid}`, { flag: "wx" })).match(
    () => true,
    (error) => {
      if ("code" in error && error.code === "EEXIST") return false;
      throw error;
    },
  );

// An empty lock has no process id yet, and `Number("")` would read it as process 0, so it is undefined here
const readLockProcessId = (path: string): number | undefined =>
  getResult(() => readFileSync(path, "utf8")).match(
    (text) => (text.length > 0 && Number.isInteger(Number(text)) ? Number(text) : undefined),
    () => undefined,
  );

// A lock with no process id yet is its writer's while it is fresh, since the writer writes its id in just after creating it
const checkIsLockFresh = (path: string): boolean =>
  getResult(() => statSync(path).mtimeMs).match(
    (mtimeMilliseconds) => Date.now() - mtimeMilliseconds < EMPTY_LOCK_GRACE_MILLISECONDS,
    () => false,
  );

// Whether a live process holds the lock: the process id it holds, or a fresh lock with none written in yet
const checkIsLockHeld = (path: string): boolean => {
  const processId = readLockProcessId(path);
  return processId === undefined ? checkIsLockFresh(path) : checkIsWatching(processId, process.pid);
};

// Moves the lock aside, which is false when there was no lock at the path to move
const moveLockAside = (path: string, movedPath: string): boolean =>
  getResult(() => renameSync(path, movedPath)).match(
    () => true,
    (error) => {
      if (checkIsNotFound(error)) return false;
      throw error;
    },
  );

// Puts a moved lock back under its path, unless another starter has created one there since it was moved
const restoreLock = (movedPath: string, path: string) => {
  getResult(() => linkSync(movedPath, path)).match(noop, (error) => {
    if (!("code" in error && error.code === "EEXIST")) throw error;
  });
  rmSync(movedPath, { force: true });
};

// Replaces the lock at the path once its holder is gone. The lock is moved aside before its holder is read, so the lock
// Judged is the one removed: a fresh lock another starter created after this one was read is moved back, never removed
const replaceStaleLock = (path: string): boolean => {
  const movedPath = `${path}.${process.pid}.moved`;
  if (!moveLockAside(path, movedPath)) return createLock(path);
  if (checkIsLockHeld(movedPath)) {
    restoreLock(movedPath, path);
    return false;
  }
  rmSync(movedPath, { force: true });
  return createLock(path);
};

// A takeover lock left by a starter that died mid-takeover is replaced, as the claim it guards would otherwise block
const acquireTakeoverLock = (): boolean =>
  createLock(MACHINE_LOCK_TAKEOVER_PATH) || replaceStaleLock(MACHINE_LOCK_TAKEOVER_PATH);

// Whether this process now holds the machine's watcher claim. Taken before the first sample, so a second watcher sees it
// From the moment it starts, and a claim is taken over only when its holder's process is gone
export const claimMachineWatch = (): boolean => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  if (createLock(MACHINE_LOCK_PATH)) return true;
  if (checkIsLockHeld(MACHINE_LOCK_PATH) || !acquireTakeoverLock()) return false;
  // Under the takeover lock, so only one starter at a time judges the claim
  const isTakenOver = replaceStaleLock(MACHINE_LOCK_PATH);
  rmSync(MACHINE_LOCK_TAKEOVER_PATH, { force: true });
  return isTakenOver;
};
