import { REMOTE_MAIN_REF } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";

// Merges `main` into the checkout (`ai/queue`) when `main` was pushed by hand and is not behind the queue. A conflict
// Is aborted, and the run fails naming the paths, since only a session can resolve it.
export const mergeMain = (): void => {
  getResult(() => runGit(["merge", "--no-edit", REMOTE_MAIN_REF])).match(noop, (error) => {
    const conflicted = getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"]));
    // A merge refused before it began, such as over an untracked file, has no merge in progress to abort
    if (conflicted.length === 0) throw error;

    runGit(["merge", "--abort"]);
    throw new InvalidOperationError(
      Operation.Update,
      "main",
      `it diverged, and merging it conflicts in: ${conflicted.join(", ")}`,
    );
  });
};
