import { checkIsWatching } from "#src/services/machine/checkIsWatching";
import {
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { getResult } from "@esposter/shared";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

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

// Under the takeover lock, the claim is read again: a starter that took it over just before this one holds it now
const takeOverLock = (): boolean => {
  if (checkIsWatching(readLockProcessId(MACHINE_LOCK_PATH), process.pid)) return false;
  rmSync(MACHINE_LOCK_PATH, { force: true });
  return createLock(MACHINE_LOCK_PATH);
};

// A takeover lock left by a starter that died mid-takeover is removed, as the claim it guards would otherwise block
const acquireTakeoverLock = (): boolean => {
  if (createLock(MACHINE_LOCK_TAKEOVER_PATH)) return true;
  if (checkIsWatching(readLockProcessId(MACHINE_LOCK_TAKEOVER_PATH), process.pid)) return false;
  rmSync(MACHINE_LOCK_TAKEOVER_PATH, { force: true });
  return createLock(MACHINE_LOCK_TAKEOVER_PATH);
};

// Whether this process now holds the machine's watcher claim. Taken before the first sample, so a second watcher sees it
// From the moment it starts, and a claim is taken over only when its holder's process is gone
export const claimMachineWatch = (): boolean => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  if (createLock(MACHINE_LOCK_PATH)) return true;
  if (checkIsWatching(readLockProcessId(MACHINE_LOCK_PATH), process.pid) || !acquireTakeoverLock()) return false;
  const isTakenOver = takeOverLock();
  rmSync(MACHINE_LOCK_TAKEOVER_PATH, { force: true });
  return isTakenOver;
};
