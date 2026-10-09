import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { rmSync } from "node:fs";

// Deletes the hold file of `worker` on `entry`, which stops that worker's hold running on this machine. A file already gone is no error
export const removeHoldFile = (entry: string, worker: string): void => {
  rmSync(getHoldFilePath(entry, worker), { force: true });
};
