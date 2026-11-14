import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The workspace manifest only ever sits at the repository root, so walking up to it is an answer that survives a file moving
// Directory. The name is kept as a literal because the package does not depend on the configuration package that owns it
const WORKSPACE_MANIFEST_NAME = "pnpm-workspace.yaml";

export const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, WORKSPACE_MANIFEST_NAME))) return directory;
  const parent = dirname(directory);
  if (parent === directory) throw new Error(`No ${WORKSPACE_MANIFEST_NAME} above ${directory}`);
  return findRepositoryRoot(parent);
};
