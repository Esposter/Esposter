import type { SpawnSyncReturns } from "node:child_process";

import { checkIsTimedOut } from "#src/services/shared/checkIsTimedOut";
import { CHILD_PROCESS_TIMEOUT_MS, MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { timedOutGitError } from "#src/services/shared/timedOutGitError";
import { spawnSync } from "@esposter/shared-node/child-process";

// A git command whose failure is an answer to read rather than an error to throw: a push the remote turned down, a pull
// That stopped on a conflict. Its status and both streams come back for the caller to decide on, as `runGit` throws.
// A timeout is not such an answer: a caller that read a null status would retry the same stalled call, so it throws
// Naming the command instead
export const spawnGit = (
  args: string[],
  cwd: string = REPOSITORY_ROOT,
  timeout: number = CHILD_PROCESS_TIMEOUT_MS,
): SpawnSyncReturns<string> => {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    env: getGitEnv(),
    maxBuffer: MAX_BUFFER_BYTES,
    timeout,
  });
  if (checkIsTimedOut(result.error)) throw timedOutGitError(args, timeout);
  return result;
};
