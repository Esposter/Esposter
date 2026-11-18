import { checkIsLockCreated } from "#src/services/machine/checkIsLockCreated";
import { checkIsLockHeld } from "#src/services/machine/checkIsLockHeld";
import { checkIsStaleLockReplaced } from "#src/services/machine/checkIsStaleLockReplaced";
import { checkIsTakeoverLockAcquired } from "#src/services/machine/checkIsTakeoverLockAcquired";
import { rmSync } from "node:fs";

// Whether this process now holds the lock at `path`: created exclusively, or taken over from a holder that is gone
export const checkIsLockTaken = (path: string, takeoverPath: string): boolean => {
  if (checkIsLockCreated(path)) return true;
  if (checkIsLockHeld(path) || !checkIsTakeoverLockAcquired(takeoverPath)) return false;
  // Under the takeover lock, so only one starter at a time judges the holder. The holder read above may have been replaced
  // Since, so the lock is created if the path is free, and moved aside only while the holder found there is still gone.
  // A live lock another starter has made is never moved
  const isTakenOver = checkIsLockCreated(path) || (!checkIsLockHeld(path) && checkIsStaleLockReplaced(path));
  rmSync(takeoverPath, { force: true });
  return isTakenOver;
};
