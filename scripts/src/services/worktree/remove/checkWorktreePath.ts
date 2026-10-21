import { InvalidOperationError, Operation } from "@esposter/shared";
import { isAbsolute } from "node:path";

// A relative path resolves against the working directory, so the same name would remove a different worktree from each
// place it is run from; it is refused before anything is read from the disk
export const checkWorktreePath = (path: string): void => {
  if (!isAbsolute(path))
    throw new InvalidOperationError(
      Operation.Delete,
      path,
      "a relative path resolves against the working directory; give the worktree's full path",
    );
};
