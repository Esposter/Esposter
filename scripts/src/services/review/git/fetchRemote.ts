import { MAIN_BRANCH, QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// The remote tips of `main` and `ai/queue`, which every step after it reads
export const fetchRemote = (): void => {
  runGit([
    "fetch",
    "--quiet",
    "origin",
    `+refs/heads/${MAIN_BRANCH}:refs/remotes/origin/${MAIN_BRANCH}`,
    `+refs/heads/${QUEUE_BRANCH}:refs/remotes/origin/${QUEUE_BRANCH}`,
  ]);
};
