import { checkIsLockCreated } from "#src/services/machine/checkIsLockCreated";
import { checkIsStaleLockReplaced } from "#src/services/machine/checkIsStaleLockReplaced";

// A takeover lock left by a starter that died mid-takeover is replaced, as the lock it guards would otherwise block
export const checkIsTakeoverLockAcquired = (takeoverPath: string): boolean =>
  checkIsLockCreated(takeoverPath) || checkIsStaleLockReplaced(takeoverPath);
