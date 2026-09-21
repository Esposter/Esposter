import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { runGit } from "#src/services/shared/runGit";

// Every original a copy anywhere on `branch` names. The whole history, never the part above a merge base: the
// Queue is rebuilt onto `develop` after every window and `develop` carries the fold of `main`, so the copy of a
// Queue commit sits below the merge base the run after it lands — and reads as owed again from there if the
// Walk stops at the base. One `git log` over the branch is well under a second on this repository.
export const readPortedShas = (branch: string, cwd?: string): Set<string> =>
  getPortedShas(runGit(["log", "--format=%b", branch], cwd));
