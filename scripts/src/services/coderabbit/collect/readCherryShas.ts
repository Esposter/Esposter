import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// What `head` still owes `upstream`, by patch id, so a cherry-picked copy on develop is not owed. Only commits
// The queue authored count: a merge of `main` into the queue brings `main`'s commits and the merge itself.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const authored = new Set(
    getNonEmptyLines(runGit(["rev-list", "--no-merges", head, `^${upstream}`, `^origin/${MAIN_BRANCH}`], cwd)),
  );
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter((sha) => authored.has(sha));
};
