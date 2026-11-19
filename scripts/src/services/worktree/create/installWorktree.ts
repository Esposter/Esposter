import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { timePhase } from "#src/services/timing/timePhase";
import { INSTALL_FROZEN_ARGUMENTS, INSTALL_OFFLINE_ARGUMENTS } from "#src/services/worktree/create/constants";
import { readInstallFilters } from "#src/services/worktree/create/readInstallFilters";
import { WORKTREE_REMOVE_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Installs the closures `readInstallFilters` selects: the scripts package's, the packages named, and the app's dependencies,
// Never the rest of the workspace. The offline install after the frozen one is the second half of the recipe, which leaves
// Pnpm's own state settled
export const installWorktree = (worktreePath: string, packageNames: string[]): void => {
  const filters = readInstallFilters(packageNames);
  const installs = [
    ["install frozen", INSTALL_FROZEN_ARGUMENTS],
    ["install offline", INSTALL_OFFLINE_ARGUMENTS],
  ] as const;
  for (const [phase, command] of installs) {
    const { status, stderr } = timePhase(phase, () =>
      spawnPnpm([...command, ...filters], { cwd: worktreePath, maxBuffer: MAX_BUFFER_BYTES }),
    );
    if (status !== 0)
      throw new InvalidOperationError(
        Operation.Create,
        worktreePath,
        `the install failed: ${readFirstLine(stderr)}; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
      );
  }
};
