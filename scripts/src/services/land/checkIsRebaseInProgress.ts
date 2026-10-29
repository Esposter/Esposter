import { runGit } from "#src/services/shared/runGit";
import { existsSync } from "node:fs";

// The two directories git keeps while a rebase is stopped, one for each of its backends
const REBASE_STATE_NAMES = ["rebase-merge", "rebase-apply"];

// A pull that stopped on a conflict leaves its rebase in progress, and a pull that failed for any other reason leaves none
export const checkIsRebaseInProgress = (): boolean =>
  REBASE_STATE_NAMES.some((name) =>
    existsSync(runGit(["rev-parse", "--path-format=absolute", "--git-path", name]).trim()),
  );
