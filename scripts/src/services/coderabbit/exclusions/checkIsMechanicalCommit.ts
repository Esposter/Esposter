import { checkIsMechanicalRange } from "#src/services/coderabbit/exclusions/checkIsMechanicalRange";

// One commit against its first parent — which queue commits the lane may take. What it may push is the range
// Form asked of the cut, since a patch replayed onto another base is not the diff it was authored as.
export const checkIsMechanicalCommit = (sha: string, cwd?: string): boolean =>
  checkIsMechanicalRange([`${sha}^`, sha], cwd);
