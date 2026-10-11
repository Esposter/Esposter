import { getResult } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";

// Gives a lock up, once the process that took it is done with it, and only while it is still this process's, so a lock
// Another process has taken over is never removed
export const releaseProcessLock = (lockPath: string): void => {
  const holder = getResult(() => readFileSync(lockPath, "utf8")).match(
    (text) => text,
    () => "",
  );
  if (holder === String(process.pid)) rmSync(lockPath, { force: true });
};
