import type { SpawnSyncReturns } from "node:child_process";

import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { spawnSync } from "@esposter/shared-node/child-process";

// A git command whose failure is an answer to read rather than an error to throw: a push the remote turned down, a pull
// That stopped on a conflict. Its status and both streams come back for the caller to decide on, as `runGit` throws
export const spawnGit = (args: string[], cwd: string = REPOSITORY_ROOT): SpawnSyncReturns<string> =>
  spawnSync("git", args, { cwd, encoding: "utf8", env: getGitEnv(), maxBuffer: MAX_BUFFER_BYTES });
