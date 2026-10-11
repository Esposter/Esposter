import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The workspace manifest's name, the same as @esposter/configuration's WORKSPACE_FILE. It is kept here as a literal
// Because the build entry walks up to the root before any workspace package can load, so it cannot import that constant.
const WORKSPACE_MANIFEST_NAME = "pnpm-workspace.yaml";

// The error a walk that reaches the file system root throws. It extends Error rather than InvalidOperationError, since the
// Build entry loads this file before any workspace package can be imported.
class WorkspaceManifestMissingError extends Error {
  constructor(directory: string) {
    super(`No ${WORKSPACE_MANIFEST_NAME} above ${directory}`);
    this.name = "WorkspaceManifestMissingError";
  }
}

// Walks up from a directory to the one holding the workspace manifest. The manifest only ever sits at the root, so
// Walking up to it is an answer that survives a file moving directory.
export const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, WORKSPACE_MANIFEST_NAME))) return directory;
  const parent = dirname(directory);
  if (parent === directory) throw new WorkspaceManifestMissingError(directory);
  return findRepositoryRoot(parent);
};
