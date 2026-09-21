import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { readPortedShas } from "#src/services/coderabbit/collect/readPortedShas";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// What `head` still owes `upstream`: not on it by patch id, and not named as the original of a copy it carries —
// Or of a copy `main` carries, since the express lane cuts a queue commit onto `main` while a window is still in
// Flight and the fold brings it to `develop` later. The copy test is the exact one — a fix landing within a
// Hunk's context lines changes the copy's patch id, after which `git cherry` reads a ported commit as owed and
// Re-picking it is the conflict nobody authored. Only commits the head authored count: a merge of `main` into
// The queue brings `main`'s commits and the merge itself.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const main = `origin/${MAIN_BRANCH}`;
  // `git cherry` reads a commit that changes nothing as owed, and it can never be: what an empty commit carries
  // Is its message, and the message is the record that the target already holds the change (`checkIsPicked`,
  // `getSyncPrompt`). So the diff filter drops it here, and the queue sheds it on the rewrite that follows
  const authored = new Set(
    getNonEmptyLines(
      runGit(["log", "--format=%H", "--no-merges", "--diff-filter=ACDMRT", head, `^${upstream}`, `^${main}`], cwd),
    ),
  );
  const portedShas = new Set([...readPortedShas(upstream, head, cwd), ...readPortedShas(main, head, cwd)]);
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter(
    (sha) => authored.has(sha) && !portedShas.has(sha),
  );
};
