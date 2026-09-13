import { checkIsMechanicalRange } from "#src/services/coderabbit/exclusions/checkIsMechanicalRange";

// One commit against its first parent — the question the express lane asks to decide which queue commits it may
// Take at all. What it may *push* is the same question asked of the cut those picks produce, which is the range
// Form, because a patch replayed onto another base and stacked with its siblings is not the diff it was authored
// As.
export const checkIsMechanicalCommit = (sha: string, cwd?: string): boolean =>
  checkIsMechanicalRange([`${sha}^`, sha], cwd);
