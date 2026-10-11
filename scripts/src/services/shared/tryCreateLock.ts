import { getResult } from "@esposter/shared";
import { writeFileSync } from "node:fs";

// Creates the lock exclusively, so only one of several racing processes writes it
export const tryCreateLock = (lockPath: string): boolean =>
  getResult(() => writeFileSync(lockPath, String(process.pid), { flag: "wx" })).match(
    () => true,
    () => false,
  );
