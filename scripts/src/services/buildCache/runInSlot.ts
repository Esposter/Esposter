import { getResult, noop } from "@esposter/shared";
import { mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { SlotAdmission } from "#src/models/buildCache/SlotAdmission";

import { checkCanAdmit } from "#src/services/buildCache/checkCanAdmit";
import {
  SLOT_DIRECTORY,
  SLOT_MAX_POLL_MILLISECONDS,
  SLOT_MIN_POLL_MILLISECONDS,
  SLOT_STALE_SECONDS,
} from "#src/services/buildCache/constants";
import { getSlotCount } from "#src/services/buildCache/getSlotCount";
import { readSlotMemory } from "#src/services/buildCache/readSlotMemory";

const ADMIT_LOCK_PATH = join(SLOT_DIRECTORY, "admit.lock");
const ADMISSION_PATH = join(SLOT_DIRECTORY, "admitted");
const HOLDER_FILE = "pid";

const checkIsProcessAlive = (pid: number): boolean =>
  getResult(() => process.kill(pid, 0)).match(
    () => true,
    () => false,
  );

// Creates a lock or slot directory and records this process as its holder; false when it already exists
const tryMakeHeldDirectory = (directoryPath: string): boolean =>
  getResult(() => mkdirSync(directoryPath)).match(
    () => {
      writeFileSync(join(directoryPath, HOLDER_FILE), String(process.pid));
      return true;
    },
    () => false,
  );

const readHolderPid = (directoryPath: string): number | undefined =>
  getResult(() => Number(readFileSync(join(directoryPath, HOLDER_FILE), "utf8"))).match(
    (pid) => (Number.isInteger(pid) && pid > 0 ? pid : undefined),
    () => undefined,
  );

// A directory is stale when its holder died, or when it has no holder a minute after it was made
const checkIsStale = (directoryPath: string): boolean => {
  const holderPid = readHolderPid(directoryPath);
  if (holderPid !== undefined) return !checkIsProcessAlive(holderPid);
  return getResult(() => statSync(directoryPath)).match(
    (stat) => Date.now() / 1000 - stat.mtimeMs / 1000 > SLOT_STALE_SECONDS,
    () => false,
  );
};

// Frees a stale directory by renaming it away first: only one runner's rename succeeds, so no two free the same one
const freeStaleDirectory = (directoryPath: string): void => {
  const claimedPath = `${directoryPath}.${process.pid}.stale`;
  getResult(() => renameSync(directoryPath, claimedPath)).match(
    () => rmSync(claimedPath, { force: true, recursive: true }),
    noop,
  );
};

const readAdmission = (): SlotAdmission | undefined =>
  getResult(() => readFileSync(ADMISSION_PATH, "utf8").trim().split(" ").map(Number)).match(
    (fields) => {
      const [admittedAt, admittedPid] = fields;
      return admittedAt !== undefined &&
        admittedPid !== undefined &&
        Number.isInteger(admittedAt) &&
        Number.isInteger(admittedPid)
        ? { admittedAt, admittedPid }
        : undefined;
    },
    () => undefined,
  );

const admitIntoSlot = (): string | undefined => {
  const { freeMemory, totalMemory } = readSlotMemory();
  const isAdmittable = checkCanAdmit({
    admission: readAdmission(),
    freeMemory,
    isProcessAlive: checkIsProcessAlive,
    now: Math.floor(Date.now() / 1000),
    totalMemory,
  });
  if (!isAdmittable) return undefined;

  for (let slot = 1; slot <= getSlotCount(); slot++) {
    const slotPath = join(SLOT_DIRECTORY, String(slot));
    if (checkIsStale(slotPath)) freeStaleDirectory(slotPath);
    if (!tryMakeHeldDirectory(slotPath)) continue;
    // The admission is written in seconds, the unit the shell gate reads, so both gates see one record
    writeFileSync(ADMISSION_PATH, `${Math.floor(Date.now() / 1000)} ${process.pid}`);
    return slotPath;
  }
  return undefined;
};

// One attempt: the admit lock is taken for the check and the take alone, then released. The lock is freed by a stale
// Reclaim like a slot's, so a runner killed under it does not wedge the others
const tryAcquireSlot = (): string | undefined => {
  mkdirSync(SLOT_DIRECTORY, { recursive: true });
  if (!tryMakeHeldDirectory(ADMIT_LOCK_PATH)) {
    if (!checkIsStale(ADMIT_LOCK_PATH)) return undefined;
    freeStaleDirectory(ADMIT_LOCK_PATH);
    if (!tryMakeHeldDirectory(ADMIT_LOCK_PATH)) return undefined;
  }
  const slotPath = admitIntoSlot();
  rmSync(ADMIT_LOCK_PATH, { force: true, recursive: true });
  return slotPath;
};

const sleep = (milliseconds: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)), 0, 0, milliseconds);
};

// Runs a heavy synchronous command once a machine-wide slot is free, releasing the slot after it returns. The same
// Layout as the shell gate's, so a node run and a shell run count against one set of slots. A run that throws keeps its
// Slot until a later runner finds its holder dead, which the build's own exit does at once
export const runInSlot = <T>(run: () => T): T => {
  let slotPath = tryAcquireSlot();
  let pollMilliseconds = SLOT_MIN_POLL_MILLISECONDS;
  while (slotPath === undefined) {
    sleep(pollMilliseconds);
    pollMilliseconds = Math.min(pollMilliseconds * 2, SLOT_MAX_POLL_MILLISECONDS);
    slotPath = tryAcquireSlot();
  }
  const result = run();
  rmSync(slotPath, { force: true, recursive: true });
  return result;
};
