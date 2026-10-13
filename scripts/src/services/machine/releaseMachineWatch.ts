import { MACHINE_LOCK_PATH } from "#src/services/machine/constants";
import { getResult } from "@esposter/shared";
import { readFileSync, rmSync } from "node:fs";

// Removes the claim only while this process still holds it, so a watcher that exits never clears another's
export const releaseMachineWatch = (): void => {
  getResult(() => readFileSync(MACHINE_LOCK_PATH, "utf8")).match(
    (holder) => {
      if (holder === `${process.pid}`) rmSync(MACHINE_LOCK_PATH, { force: true });
    },
    () => undefined,
  );
};
