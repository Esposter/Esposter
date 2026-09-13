import {
  CONTENT_PROTECTED_SUFFIXES,
  RELOCATION_PROTECTED_DIRECTORIES,
  RELOCATION_PROTECTED_SUFFIXES,
} from "#src/services/coderabbit/exclusions/constants";

// The classes `exclusions.md` § When to exclude never lets out on a content change, whatever the diff says: a
// Test is the behaviour contract, docs and skills are the design record, and config, schema and migration inputs
// Are small diffs with a large blast radius. A rename out of a protected tree is still a change to that tree, so
// Callers test both paths. Whether a *relocation* of one is mechanical is the narrower question
// `checkIsRelocatablePath` answers.
export const checkIsProtectedPath = (path: string): boolean =>
  [...CONTENT_PROTECTED_SUFFIXES, ...RELOCATION_PROTECTED_SUFFIXES].some((suffix) => path.endsWith(suffix)) ||
  RELOCATION_PROTECTED_DIRECTORIES.some((directory) => path.startsWith(directory));
