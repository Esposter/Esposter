import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The workspace manifest's name, the same as @esposter/configuration's WORKSPACE_FILE. It is kept here as a literal
// Because the build entry walks up to the root before any workspace package can load, so it cannot import that constant.
const WORKSPACE_MANIFEST_NAME = "pnpm-workspace.yaml";

// Walks up from a directory to the one holding the workspace manifest. The manifest only ever sits at the root, so
// Walking up to it is an answer that survives a file moving directory.
export const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, WORKSPACE_MANIFEST_NAME))) return directory;
  const parent = dirname(directory);
  // No workspace package can be imported to throw an InvalidOperationError from this file, which the entry loads first
  if (parent === directory) throw new Error(`No ${WORKSPACE_MANIFEST_NAME} above ${directory}`);
  return findRepositoryRoot(parent);
};
