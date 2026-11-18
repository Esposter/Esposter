import { INSTALL_LOCK_PATH } from "#src/services/machine/constants";
import { releaseLock } from "#src/services/machine/releaseLock";
import { takeInstallLock } from "#src/services/machine/takeInstallLock";
import { withFinalizerAsync } from "@esposter/shared";

// Runs `run` holding the machine's install lock, released whichever way it resolves, so an install that fails never leaves
// The next one waiting on a lock nothing holds
export const withInstallLock = async <T>(run: () => Promise<T> | T): Promise<T> => {
  await takeInstallLock();
  return withFinalizerAsync<T>(run, () => {
    releaseLock(INSTALL_LOCK_PATH);
  });
};
