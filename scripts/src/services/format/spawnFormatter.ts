import type { Operation } from "@esposter/shared";
import type { SpawnSyncReturns } from "node:child_process";

import { checkIsTimedOut } from "#src/services/shared/checkIsTimedOut";
import {
  CHILD_PROCESS_TIMEOUT_MS,
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_RELATIVE_PATH,
  OXFMT_CONFIGURATION_FILE,
} from "#src/services/shared/constants";
import { timedOutError } from "#src/services/shared/timedOutError";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";

// The repository's formatter binary runs from the main checkout, which holds its install, under the configuration and
// The working directory of the checkout the files are in. Its ignore patterns match a path as it is given from that
// Working directory, so the paths in `args` are repository-relative. A formatter still running past its `timeout` is
// Killed with SIGKILL, since a spawn waits for a child that ignores SIGTERM to exit, and the error names the operation,
// The path and the `command` it ran
export const spawnFormatter = (
  args: string[],
  repositoryRoot: string,
  mainCheckoutRoot: string,
  {
    command,
    input,
    name,
    operation,
    timeout = CHILD_PROCESS_TIMEOUT_MS,
  }: { command: string; input?: string; name: string; operation: Operation; timeout?: number },
): SpawnSyncReturns<string> => {
  const result = spawnSync(
    process.execPath,
    [
      join(mainCheckoutRoot, OXFMT_BINARY_RELATIVE_PATH),
      "--config",
      join(repositoryRoot, OXFMT_CONFIGURATION_FILE),
      ...args,
    ],
    { cwd: repositoryRoot, encoding: "utf8", input, killSignal: "SIGKILL", maxBuffer: MAX_BUFFER_BYTES, timeout },
  );
  if (checkIsTimedOut(result.error)) throw timedOutError(operation, name, timeout, command);
  return result;
};
