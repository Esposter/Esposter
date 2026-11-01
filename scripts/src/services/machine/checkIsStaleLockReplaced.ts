import { checkIsLockCreated } from "#src/services/machine/checkIsLockCreated";
import { checkIsLockHeld } from "#src/services/machine/checkIsLockHeld";
import { checkIsLockMovedAside } from "#src/services/machine/checkIsLockMovedAside";
import { restoreLock } from "#src/services/machine/restoreLock";
import { rmSync } from "node:fs";

// Replaces the lock at the path once its holder is gone. The lock is moved aside before its holder is read, so the lock
// Judged is the one removed: a fresh lock another starter created after this one was read is moved back, never removed
export const checkIsStaleLockReplaced = (path: string): boolean => {
  const movedPath = `${path}.${process.pid}.moved`;
  if (!checkIsLockMovedAside(path, movedPath)) return checkIsLockCreated(path);
  if (checkIsLockHeld(movedPath)) {
    restoreLock(movedPath, path);
    return false;
  }
  rmSync(movedPath, { force: true });
  return checkIsLockCreated(path);
};
