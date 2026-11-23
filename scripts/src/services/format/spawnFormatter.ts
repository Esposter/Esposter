import type { SpawnSyncReturns } from "node:child_process";

import {
  CHILD_PROCESS_TIMEOUT_MS,
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_RELATIVE_PATH,
  OXFMT_CONFIGURATION_FILE,
} from "#src/services/shared/constants";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";

// The repository's formatter binary runs from the main checkout, which holds its install, under the configuration and
// The Working directory of the checkout the files are in. Its ignore patterns match a path as it is given from that
// Working Directory, so the paths in `args` are repository-relative. A formatter still running past its `timeout` is
// Killed with SIGKILL, since a spawn waits for a child that ignores SIGTERM to exit, and its null status is the
// Caller's to read. Its Colour is off whatever the caller's terminal asks for, since its message is read back as the
// Text of an error
export const spawnFormatter = (
  args: string[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
  timeout: number = CHILD_PROCESS_TIMEOUT_MS,
  input?: string,
): SpawnSyncReturns<string> =>
  spawnSync(
    process.execPath,
    [
      join(mainCheckoutRoot, OXFMT_BINARY_RELATIVE_PATH),
      "--config",
      join(repositoryRoot, OXFMT_CONFIGURATION_FILE),
      ...args,
    ],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
      input,
      killSignal: "SIGKILL",
      maxBuffer: MAX_BUFFER_BYTES,
      timeout,
    },
  );
