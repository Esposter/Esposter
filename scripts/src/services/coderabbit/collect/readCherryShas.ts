import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { readPortedShas } from "#src/services/coderabbit/collect/readPortedShas";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// What `head` still owes `upstream`: not on it by patch id, and not named as the original of a copy it carries.
// The second test is the exact one — a fix landing within a hunk's context lines changes the copy's patch id,
// After which `git cherry` reads a ported commit as owed and re-picking it is the conflict nobody authored.
// Only commits the head authored count: a merge of `main` into the queue brings `main`'s commits and the merge itself.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const authored = new Set(
    getNonEmptyLines(runGit(["rev-list", "--no-merges", head, `^${upstream}`, `^origin/${MAIN_BRANCH}`], cwd)),
  );
  const ported = readPortedShas(upstream, head, cwd);
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter((sha) => authored.has(sha) && !ported.has(sha));
};
