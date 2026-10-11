import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawn } from "node:child_process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";

// Starts `pnpm ai:fleet:hold <id> --worker <worker>` detached, its output in a log beside the holds' pid files, and
// Leaves it running after this process exits. It is spawned without a shell, so on Windows it outlives this run
export const startFleetHold = (id: string, worker: string): void => {
  mkdirSync(HOLDS_DIRECTORY, { recursive: true });
  const logDescriptor = openSync(join(HOLDS_DIRECTORY, `${id}.${worker}.log`), "a");
  const child = spawn("pnpm", ["ai:fleet:hold", id, "--worker", worker], {
    cwd: REPOSITORY_ROOT,
    detached: true,
    stdio: ["ignore", logDescriptor, logDescriptor],
    windowsHide: true,
  });
  child.on("error", (error) => console.error(`could not start the hold for ${id}: ${error.message}`));
  child.unref();
  closeSync(logDescriptor);
};
