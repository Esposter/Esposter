import { JUNCTION_UNLINK_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// `git worktree remove` deletes through a junction into the main checkout's node_modules and empties that install, so
// PowerShell unlinks each junction first; it is Windows-only, where junctions exist
export const unlinkJunctions = (worktreePath: string): void => {
  const { status, stderr } = spawnSync("pwsh", ["-NoProfile", "-Command", JUNCTION_UNLINK_COMMAND], {
    encoding: "utf8",
    env: { ...process.env, WORKTREE: worktreePath },
  });
  if (status !== 0)
    throw new InvalidOperationError(Operation.Delete, worktreePath, `its junctions could not be unlinked: ${stderr}`);
};
