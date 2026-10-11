import { rmSync } from "node:fs";

// Gives a lock up, once the process that took it is done with it
export const releaseProcessLock = (lockPath: string): void => rmSync(lockPath, { force: true });
