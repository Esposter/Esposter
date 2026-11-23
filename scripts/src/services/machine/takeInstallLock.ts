import {
  INSTALL_LOCK_PATH,
  INSTALL_LOCK_TAKEOVER_PATH,
  INSTALL_LOCK_WAITING_MESSAGE,
  MACHINE_STATE_DIRECTORY,
} from "#src/services/machine/constants";
import { takeSocketLock } from "#src/services/machine/takeSocketLock";
import { mkdirSync } from "node:fs";

// Takes the machine's install lock, resolving to the release that gives it back. A starter that finds it held says it
// Waits
export const takeInstallLock = (): Promise<() => void> => {
  mkdirSync(MACHINE_STATE_DIRECTORY, { recursive: true });
  return takeSocketLock(INSTALL_LOCK_PATH, INSTALL_LOCK_TAKEOVER_PATH, () => {
    console.info(INSTALL_LOCK_WAITING_MESSAGE);
  });
};
