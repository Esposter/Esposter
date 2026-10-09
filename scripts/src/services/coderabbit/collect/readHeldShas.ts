import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { readHeldTipShas } from "#src/services/coderabbit/collect/readHeldTipShas";
import { runGit } from "#src/services/shared/runGit";

// Every identity a held commit has carried — the sha its branch holds, and each original its body names from the
// Rewrites that replayed it — so the queue's copy of it, under whichever sha it now has, is owed nowhere. A re-landed
// Copy is a new commit under a message of its own, which names none of them and is owed like any other.
export const readHeldShas = (cwd?: string): Set<string> => {
  const tipShas = readHeldTipShas(cwd);
  if (tipShas.length === 0) return new Set();
  return new Set([...tipShas, ...getPortedShas(runGit(["log", "--no-walk", "--format=%b", ...tipShas], cwd))]);
};
