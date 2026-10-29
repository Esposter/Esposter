import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { checkIsOrphanPath } from "#src/services/worktree/remove/checkIsOrphanPath";
import { checkWorktreePath } from "#src/services/worktree/remove/checkWorktreePath";
import { GIT_FOLDER, WORKTREE_TRASH_FOLDER } from "#src/services/worktree/remove/constants";
import { deleteBranch } from "#src/services/worktree/remove/deleteBranch";
import { emptyTrash } from "#src/services/worktree/remove/emptyTrash";
import { removeInstalls } from "#src/services/worktree/remove/removeInstalls";
import { removeTree } from "#src/services/worktree/remove/removeTree";
import { unlinkJunctions } from "#src/services/worktree/remove/unlinkJunctions";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

// Removes a linked worktree, and its branch once that has landed, or a folder under the worktrees folder that git no
// Longer lists. Git still refuses a dirty linked worktree; on Windows the junctions and the loaded binaries are dealt
// With first, so no deletion walks out of the worktree or stops part way on a long path. The git calls that act on the
// Repository run from `repositoryRoot`, so a removal run from inside the worktree it removes still has a checkout to ask
export const removeWorktree = (path: string, repositoryRoot: string = REPOSITORY_ROOT): void => {
  checkWorktreePath(path);
  const worktreePath = resolve(path);
  if (!existsSync(worktreePath)) {
    // The record of a folder already gone is pruned before the refusal, since git keeps listing it until it is
    runGit(["worktree", "prune"], repositoryRoot);
    throw new InvalidOperationError(Operation.Delete, worktreePath, "there is no folder at this path");
  }
  const isLinked = existsSync(join(worktreePath, GIT_FOLDER));
  if (!isLinked && !checkIsOrphanPath(worktreePath))
    throw new InvalidOperationError(
      Operation.Delete,
      worktreePath,
      "it is not a worktree, nor a folder in the worktrees folder",
    );
  const branch = isLinked
    ? getResult(() => runGit(["symbolic-ref", "--quiet", "--short", "HEAD"], worktreePath)).match(
        (ref) => ref.trim(),
        () => "",
      )
    : "";

  if (process.platform === "win32") {
    unlinkJunctions(worktreePath);
    const trashPath = join(
      runGit(["rev-parse", "--path-format=absolute", "--git-common-dir"], worktreePath).trim(),
      WORKTREE_TRASH_FOLDER,
    );
    emptyTrash(trashPath);
    if (isLinked) removeInstalls(worktreePath, trashPath);
    else removeTree(worktreePath, trashPath);
  }

  if (isLinked) runGit(["worktree", "remove", worktreePath], repositoryRoot);
  else rmSync(worktreePath, { force: true, recursive: true });
  runGit(["worktree", "prune"], repositoryRoot);
  if (branch !== "") deleteBranch(branch, repositoryRoot);
};
