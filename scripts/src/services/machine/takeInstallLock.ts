/* oxlint-disable no-await-in-loop -- Each step reads the last: each wait is for the lock to change or its holder to be judged again, and the lock is read again after it */
import { checkIsLockTaken } from "#src/services/machine/checkIsLockTaken";
import {
  INSTALL_LOCK_PATH,
  INSTALL_LOCK_RECHECK_MILLISECONDS,
  INSTALL_LOCK_TAKEOVER_PATH,
  INSTALL_LOCK_WAITING_MESSAGE,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { withFinalizerAsync } from "@esposter/shared";
import { mkdirSync, watch } from "node:fs";

// Takes the machine's install lock, waiting while another install holds it. The folder is watched before the lock is first
// Read, so a release that lands between the read and the wait still wakes it, and a holder that is gone is taken over
export const takeInstallLock = async (): Promise<void> => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  let changed = Promise.withResolvers<void>();
  const watcher = watch(MACHINE_STATE_DIRECTORY, () => {
    changed.resolve();
  });
  await withFinalizerAsync(
    async () => {
      let isWaiting = false;
      while (!checkIsLockTaken(INSTALL_LOCK_PATH, INSTALL_LOCK_TAKEOVER_PATH)) {
        if (!isWaiting) {
          console.info(INSTALL_LOCK_WAITING_MESSAGE);
          isWaiting = true;
        }
        const recheck = Promise.withResolvers<void>();
        const recheckTimer = setTimeout(recheck.resolve, INSTALL_LOCK_RECHECK_MILLISECONDS);
        await Promise.race([changed.promise, recheck.promise]);
        clearTimeout(recheckTimer);
        changed = Promise.withResolvers<void>();
      }
    },
    () => {
      watcher.close();
    },
  );
};
