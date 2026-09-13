import {
  RELOCATION_PROTECTED_DIRECTORIES,
  RELOCATION_PROTECTED_SUFFIXES,
} from "#src/services/coderabbit/exclusions/constants";

// Whether moving this file is itself a decision. Most files answer no — where a module sits is the sweep's
// Subject rather than a claim about behaviour, and the tests that move with it say no less. The ones that answer
// Yes are read by their path: a loader finds a config by name, a migration's filename is its ordering in the
// Chain, a docs page's folder is its status and a skill's is its ownership, so relocating one changes what it
// Means. Narrower than `checkIsProtectedPath`, which refuses a content edit to a test as well.
export const checkIsRelocatablePath = (path: string): boolean =>
  !RELOCATION_PROTECTED_SUFFIXES.some((suffix) => path.endsWith(suffix)) &&
  !RELOCATION_PROTECTED_DIRECTORIES.some((directory) => path.startsWith(directory));
