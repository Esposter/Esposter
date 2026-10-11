import { rmSync } from "node:fs";

// Gives the push lock up, once the push that took it has ended
export const releasePushLock = (lockPath: string): void => rmSync(lockPath, { force: true });
