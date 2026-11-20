import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { timePhase } from "#src/services/timing/timePhase";
import { INSTALL_ARGUMENTS } from "#src/services/worktree/create/constants";
import { WORKTREE_REMOVE_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Installs the whole workspace once, linking every package from the machine's global virtual store
export const installWorktree = (worktreePath: string): void => {
  const { status, stderr } = timePhase("install", () =>
    spawnPnpm(INSTALL_ARGUMENTS, { cwd: worktreePath, maxBuffer: MAX_BUFFER_BYTES }),
  );
  if (status !== 0)
    throw new InvalidOperationError(
      Operation.Create,
      worktreePath,
      `the install failed: ${readFirstLine(stderr)}; ${WORKTREE_REMOVE_COMMAND} ${worktreePath} removes the worktree`,
    );
};
