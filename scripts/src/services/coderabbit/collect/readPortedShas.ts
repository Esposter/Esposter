import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { runGit } from "#src/services/shared/runGit";

// Every original a copy on `upstream` names since the two histories parted: a commit `head` still carries can
// Only have been ported after the last point it shared with `upstream`, so the walk stops there
export const readPortedShas = (upstream: string, head: string, cwd?: string): Set<string> => {
  const mergeBase = runGit(["merge-base", upstream, head], cwd).trim();
  return getPortedShas(runGit(["log", "--format=%b", `${mergeBase}..${upstream}`], cwd));
};
