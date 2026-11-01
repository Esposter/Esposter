import { checkIsLockCreated } from "#src/services/machine/checkIsLockCreated";
import { checkIsLockHeld } from "#src/services/machine/checkIsLockHeld";
import { checkIsStaleLockReplaced } from "#src/services/machine/checkIsStaleLockReplaced";
import { checkIsTakeoverLockAcquired } from "#src/services/machine/checkIsTakeoverLockAcquired";
import {
  MACHINE_LOCK_PATH,
  MACHINE_LOCK_TAKEOVER_PATH,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { mkdirSync, rmSync } from "node:fs";

// Whether this process now holds the machine's watcher claim. Taken before the first sample, so a second watcher sees it
// From the moment it starts, and a claim is taken over only when its holder's process is gone
export const claimMachineWatch = (): boolean => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  if (checkIsLockCreated(MACHINE_LOCK_PATH)) return true;
  if (checkIsLockHeld(MACHINE_LOCK_PATH) || !checkIsTakeoverLockAcquired()) return false;
  // Under the takeover lock, so only one starter at a time judges the claim
  const isTakenOver = checkIsStaleLockReplaced(MACHINE_LOCK_PATH);
  rmSync(MACHINE_LOCK_TAKEOVER_PATH, { force: true });
  return isTakenOver;
};
