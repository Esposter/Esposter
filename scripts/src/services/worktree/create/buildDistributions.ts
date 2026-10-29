import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// Builds each directory's distribution with the task the build runs, through `vp run` so the cache and the sibling builds
// The task depends on come with it. A failed build's output is the one the command in the message reproduces
export const buildDistributions = (worktreePath: string, directories: string[]): void => {
  for (const directory of directories) {
    const { status } = spawnSync("vp", ["run", `build:${directory}`], {
      cwd: worktreePath,
      encoding: "utf8",
      maxBuffer: MAX_BUFFER_BYTES,
    });
    if (status !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        directory,
        `its build failed; vp run build:${directory} in ${worktreePath} reproduces it`,
      );
  }
};
