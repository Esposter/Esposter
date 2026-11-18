import { takeInstallLock } from "#src/services/machine/takeInstallLock";
import { withFinalizerAsync } from "@esposter/shared";

// Runs `run` holding the machine's install lock, released whichever way it resolves, so an install that fails never leaves
// The next one waiting on a lock nothing holds
export const withInstallLock = async <T>(run: () => Promise<T> | T): Promise<T> => {
  const release = await takeInstallLock();
  return withFinalizerAsync<T>(run, release);
};
