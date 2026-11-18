import { checkIsLockCreated } from "#src/services/machine/checkIsLockCreated";
import { checkIsStaleLockReplaced } from "#src/services/machine/checkIsStaleLockReplaced";
import { MACHINE_LOCK_TAKEOVER_PATH } from "#src/services/machine/constants";

// A takeover lock left by a starter that died mid-takeover is replaced, as the claim it guards would otherwise block
export const checkIsTakeoverLockAcquired = (): boolean =>
  checkIsLockCreated(MACHINE_LOCK_TAKEOVER_PATH) || checkIsStaleLockReplaced(MACHINE_LOCK_TAKEOVER_PATH);
