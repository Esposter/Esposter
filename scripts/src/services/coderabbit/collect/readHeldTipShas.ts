import { HELD_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The commits the held branches carry (`parkCommits`), as the last fetch saw them
export const readHeldTipShas = (cwd?: string): string[] =>
  getNonEmptyLines(
    runGit(["for-each-ref", "--format=%(objectname)", `refs/remotes/origin/${HELD_BRANCH_PREFIX}`], cwd),
  );
