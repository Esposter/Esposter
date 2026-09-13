import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { runGit } from "#src/services/coderabbit/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";

// What `head` still owes `upstream`, by patch id — so a commit develop already carries as a cherry-picked copy
// Is not owed, and a queue nobody rebased is measured correctly. Merge commits are never owed: `main` merged
// Into the queue carries nothing the queue authored, a merge cannot be cherry-picked, and its content reaches
// `develop` by the same `main` sync the git skill already describes.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const merges = new Set(getNonEmptyLines(runGit(["rev-list", "--merges", `${upstream}..${head}`], cwd)));
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter((sha) => !merges.has(sha));
};
