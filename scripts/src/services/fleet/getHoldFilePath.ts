import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { join } from "node:path";

// The file a hold on `entry` keeps on this machine, which a release deletes
export const getHoldFilePath = (entry: string): string => join(HOLDS_DIRECTORY, `${entry}.pid`);
