import { HOLDS_DIRECTORY } from "#src/services/fleet/constants";
import { PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawn } from "@esposter/shared-node/child-process";
import { closeSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";

// Starts `pnpm ai:fleet:hold <id> --worker <worker>` detached, its output in a log beside the holds' pid files, and
// Leaves it running after this process exits. It is spawned through the pnpm this run is in and without a shell, so on
// Windows it starts with no `.cmd` shim to resolve and outlives this run
export const startFleetHold = (id: string, worker: string): void => {
  mkdirSync(HOLDS_DIRECTORY, { recursive: true });
  const logDescriptor = openSync(join(HOLDS_DIRECTORY, `${id}.${worker}.log`), "a");
  const child = spawn(PNPM_FILE, [...PNPM_ARGS, "ai:fleet:hold", id, "--worker", worker], {
    cwd: REPOSITORY_ROOT,
    detached: true,
    stdio: ["ignore", logDescriptor, logDescriptor],
  });
  child.on("error", (error) => console.error(`could not start the hold for ${id}: ${error.message}`));
  child.unref();
  closeSync(logDescriptor);
};
