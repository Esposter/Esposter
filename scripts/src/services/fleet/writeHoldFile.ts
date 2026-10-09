import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { getHoldFilePath } from "#src/services/fleet/getHoldFilePath";
import { mkdirSync, writeFileSync } from "node:fs";

// Records that this process holds `entry` as `worker`, with its pid, so the file names the holder and a release can end the hold
export const writeHoldFile = (entry: string, worker: string): void => {
  mkdirSync(HOLDS_DIRECTORY, { recursive: true });
  writeFileSync(getHoldFilePath(entry, worker), String(process.pid));
};
