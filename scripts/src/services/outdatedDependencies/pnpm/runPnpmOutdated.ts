import type { PnpmOutdatedRun } from "#src/models/outdatedDependencies/PnpmOutdatedRun";

import {
  PNPM_OUTDATED_ARGS,
  PNPM_OUTDATED_COMMAND,
  PNPM_OUTDATED_TIMEOUT_MS,
} from "#src/services/outdatedDependencies/pnpm/constants";
import { IS_PNPM_SHELL } from "#src/services/shared/constants";
import { spawn } from "node:child_process";

// Asynchronous rather than the collector's `spawnPnpm`, because the registry checks run beside it and a
// Synchronous child would hold their responses until it exited. The child owns its own timeout: on expiry it is
// Killed and `close` reports the signal in place of a status. A promise settles once, so `error` followed by
// `close` needs no guard.
export const runPnpmOutdated = (root: string): Promise<PnpmOutdatedRun> =>
  new Promise((resolvePromise) => {
    const child = spawn("pnpm", PNPM_OUTDATED_ARGS, {
      cwd: root,
      shell: IS_PNPM_SHELL,
      timeout: PNPM_OUTDATED_TIMEOUT_MS,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolvePromise({ error: error.message, stderr, stdout });
    });
    child.on("close", (status, signal) => {
      resolvePromise(
        status === null
          ? {
              error: `${PNPM_OUTDATED_COMMAND} was killed by ${signal} after ${PNPM_OUTDATED_TIMEOUT_MS}ms`,
              stderr,
              stdout,
            }
          : { status, stderr, stdout },
      );
    });
  });
