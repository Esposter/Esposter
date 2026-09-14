import {
  CONTENT_PROTECTED_SUFFIXES,
  RELOCATION_PROTECTED_DIRECTORIES,
  RELOCATION_PROTECTED_SUFFIXES,
} from "#src/services/coderabbit/exclusions/constants";

// The classes never let out of review on a content proof, whatever the diff says: a test is the behaviour
// Contract, docs and skills are the design record, and config, schema and migration inputs are small diffs with
// A large blast radius. Whether a *relocation* of one is mechanical is the narrower question
// `checkIsRelocatablePath` answers.
export const checkIsProtectedPath = (path: string): boolean =>
  [...CONTENT_PROTECTED_SUFFIXES, ...RELOCATION_PROTECTED_SUFFIXES].some((suffix) => path.endsWith(suffix)) ||
  RELOCATION_PROTECTED_DIRECTORIES.some((directory) => path.startsWith(directory));
