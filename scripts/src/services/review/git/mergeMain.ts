import { REMOTE_MAIN_REF } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Merges `main` into the checkout (`ai/queue`) when `main` was pushed by hand and is not behind the queue. A conflict
// is aborted, and the run fails naming the paths, since nothing can resolve it but a person.
export const mergeMain = (): void => {
  getResult(() => runGit(["merge", "--no-edit", REMOTE_MAIN_REF])).match(noop, (error) => {
    const conflicted = getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"]));
    runGit(["merge", "--abort"]);
    throw new Error(`main diverged, and merging it conflicts in: ${conflicted.join(", ")}`, { cause: error });
  });
};
