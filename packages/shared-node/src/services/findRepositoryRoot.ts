import { NotFoundError } from "@esposter/shared";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The workspace manifest's name, the same as @esposter/configuration's WORKSPACE_FILE. It is kept here as a literal
// Because this package is published with no runtime dependency on the configuration package that owns the constant
const WORKSPACE_MANIFEST_NAME = "pnpm-workspace.yaml";

// The workspace manifest only ever sits at the repository root, so walking up to it is an answer that survives a file
// Moving directory
export const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, WORKSPACE_MANIFEST_NAME))) return directory;
  const parent = dirname(directory);
  if (parent === directory) throw new NotFoundError(WORKSPACE_MANIFEST_NAME, directory);
  return findRepositoryRoot(parent);
};
