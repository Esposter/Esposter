import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { join } from "node:path";

// The file a hold by `worker` on `entry` keeps on this machine, which that worker's release deletes
export const getHoldFilePath = (entry: string, worker: string): string =>
  join(HOLDS_DIRECTORY, `${entry}.${worker}.pid`);
