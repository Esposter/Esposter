import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import {
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { getResult, noop } from "@esposter/shared";
import { linkSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";

// Create-only, so of two starters exactly one gets the file, however close together they start
const createLock = (path: string): boolean =>
  getResult(() => writeFileSync(path, `${process.pid}`, { flag: "wx" })).match(
    () => true,
    (error) => {
      if ("code" in error && error.code === "EEXIST") return false;
      throw error;
    },
  );

const readLockProcessId = (path: string): number | undefined =>
  getResult(() => Number(readFileSync(path, "utf8"))).match(
    (processId) => (Number.isInteger(processId) ? processId : undefined),
    () => undefined,
  );

// Moves the lock aside, which is false when there was no lock at the path to move
const moveLockAside = (path: string, movedPath: string): boolean =>
  getResult(() => renameSync(path, movedPath)).match(
    () => true,
    (error) => {
      if ("code" in error && error.code === "ENOENT") return false;
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
  if (checkIsWatching(readLockProcessId(movedPath), process.pid)) {
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
  if (checkIsWatching(readLockProcessId(MACHINE_LOCK_PATH), process.pid) || !acquireTakeoverLock()) return false;
  // Under the takeover lock, so only one starter at a time judges the claim
  const isTakenOver = replaceStaleLock(MACHINE_LOCK_PATH);
  rmSync(MACHINE_LOCK_TAKEOVER_PATH, { force: true });
  return isTakenOver;
};
