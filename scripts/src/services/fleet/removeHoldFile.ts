import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { rmSync } from "node:fs";

// Deletes the hold file of `entry`, which stops a hold running on this machine. A file already gone is no error
export const removeHoldFile = (entry: string): void => {
  rmSync(getHoldFilePath(entry), { force: true });
};
