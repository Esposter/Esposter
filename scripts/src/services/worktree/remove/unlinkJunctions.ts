import { CHILD_PROCESS_TIMEOUT_MS } from "#src/services/shared/constants";
import { isTimedOut } from "#src/services/shared/isTimedOut";
import { JUNCTION_UNLINK_COMMAND } from "#src/services/worktree/remove/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// `git worktree remove` deletes through a junction into the main checkout's node_modules and empties that install, so
// PowerShell unlinks each junction first; it is Windows-only, where junctions exist. A PowerShell still running past
// Its bound is killed, and the call throws naming it, since a landing with `--remove` waits on it
export const unlinkJunctions = (worktreePath: string): void => {
  const { error, status, stderr } = spawnSync("pwsh", ["-NoProfile", "-Command", JUNCTION_UNLINK_COMMAND], {
    encoding: "utf8",
    env: { ...process.env, WORKTREE: worktreePath },
    killSignal: "SIGKILL",
    timeout: CHILD_PROCESS_TIMEOUT_MS,
  });
  if (isTimedOut(error))
    throw new InvalidOperationError(
      Operation.Delete,
      worktreePath,
      `its junctions were not unlinked: pwsh ran past ${CHILD_PROCESS_TIMEOUT_MS} ms and was killed`,
    );
  if (status !== 0)
    throw new InvalidOperationError(Operation.Delete, worktreePath, `its junctions could not be unlinked: ${stderr}`);
};
