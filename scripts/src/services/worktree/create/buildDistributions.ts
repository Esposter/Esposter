import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { timePhase } from "#src/services/timing/timePhase";
import { WORKTREE_REMOVE_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// Builds each directory's distribution with the task the build runs, through `vp run`, so the cache and the tasks it
// Depends On come with it. The builds run in the order given, since each reads the dist its dependencies wrote. A
// Failed build's Output is the one the command in the message reproduces
export const buildDistributions = (worktreePath: string, directories: string[]): void => {
  for (const directory of directories) {
    const { status } = timePhase(`build ${directory}`, () =>
      spawnSync("vp", ["run", `build:${directory}`], {
        cwd: worktreePath,
        encoding: "utf8",
        maxBuffer: MAX_BUFFER_BYTES,
      }),
    );
    if (status !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        directory,
        `its build failed; vp run build:${directory} in ${worktreePath} reproduces it; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
      );
  }
};
