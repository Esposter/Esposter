import { relative } from "node:path";

// The key a test file's time is recorded under and read back by: its path from the root with forward slashes, so every
// Platform writes the same key for the same file
export const getTestTimingsKey = (root: string, moduleId: string): string =>
  relative(root, moduleId).replaceAll("\\", "/");
