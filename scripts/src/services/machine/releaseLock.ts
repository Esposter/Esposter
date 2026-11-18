import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";

// Removes the lock at `path` only while this process still holds it, so a process that exits never clears another's
export const releaseLock = (path: string): void => {
  getResult(() => readFileSync(path, "utf8")).match(
    (holder) => {
      if (holder === `${process.pid}`) rmSync(path, { force: true });
    },
    // A lock already gone is released. One that cannot be read is logged, since a throw from an exit listener is not
    // Caught, and it would only bury the exit
    (error) => {
      if (!checkIsNotFound(error)) console.error(error);
    },
  );
};
