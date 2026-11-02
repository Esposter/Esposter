import { MACHINE_LOCK_PATH } from "#src/services/machine/constants";
import { checkIsNotFound } from "#src/services/shared/checkIsNotFound";
import { getResult } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";

// Removes the claim only while this process still holds it, so a watcher that exits never clears another's
export const releaseMachineWatch = (): void => {
  getResult(() => readFileSync(MACHINE_LOCK_PATH, "utf8")).match(
    (holder) => {
      if (holder === `${process.pid}`) rmSync(MACHINE_LOCK_PATH, { force: true });
    },
    // A lock already gone is released. One that cannot be read is logged, since a throw from an exit listener is not
    // Caught, and it would only bury the exit
    (error) => {
      if (!checkIsNotFound(error)) console.error(error);
    },
  );
};
