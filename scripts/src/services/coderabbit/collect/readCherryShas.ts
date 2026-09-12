import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { runGit } from "#src/services/coderabbit/runGit";

// What `head` still owes `upstream`, by patch id — so a commit develop already carries as a cherry-picked copy
// Is not owed, and a queue nobody rebased is measured correctly.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] =>
  getCherryShas(runGit(["cherry", upstream, head], cwd));
