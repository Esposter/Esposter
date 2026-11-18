import { checkIsLockTaken } from "#src/services/machine/checkIsLockTaken";
import {
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { mkdirSync } from "node:fs";

// Whether this process now holds the machine's watcher claim. Taken before the first sample, so a second watcher sees it
// From the moment it starts, and a claim is taken over only when its holder's process is gone
export const claimMachineWatch = (): boolean => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  return checkIsLockTaken(MACHINE_LOCK_PATH, MACHINE_LOCK_TAKEOVER_PATH);
};
