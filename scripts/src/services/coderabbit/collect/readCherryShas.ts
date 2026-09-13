import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";

// What `head` still owes `upstream`, by patch id — so a commit develop already carries as a cherry-picked copy
// Is not owed, and a queue nobody rebased is measured correctly. Only commits the queue authored count: a merge
// Of `main` into the queue brings `main`'s own commits along and the merge itself, none of which the queue owes
// — a merge cannot be cherry-picked, and `main`'s content reaches `develop` by the `main` sync the git skill
// Already describes rather than as copies.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const authored = new Set(
    getNonEmptyLines(runGit(["rev-list", "--no-merges", head, `^${upstream}`, `^origin/${MAIN_BRANCH}`], cwd)),
  );
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter((sha) => authored.has(sha));
};
