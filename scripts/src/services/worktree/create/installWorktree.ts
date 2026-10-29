import { MAX_BUFFER_BYTES } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import {
  INSTALL_FROZEN_ARGUMENTS,
  INSTALL_OFFLINE_ARGUMENTS,
  SCRIPTS_PACKAGE_NAME,
} from "#src/services/worktree/create/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Installs only the closure of the scripts package and the packages named, never the app or the rest of the workspace.
// The offline install after the frozen one is the second half of the recipe, which leaves pnpm's own state settled
export const installWorktree = (worktreePath: string, packageNames: string[]): void => {
  const filters = [SCRIPTS_PACKAGE_NAME, ...packageNames].flatMap((name) => ["--filter", `${name}...`]);
  for (const command of [INSTALL_FROZEN_ARGUMENTS, INSTALL_OFFLINE_ARGUMENTS]) {
    const { status, stderr } = spawnPnpm([...command, ...filters], { cwd: worktreePath, maxBuffer: MAX_BUFFER_BYTES });
    if (status !== 0)
      throw new InvalidOperationError(Operation.Create, worktreePath, `the install failed: ${readFirstLine(stderr)}`);
  }
};
