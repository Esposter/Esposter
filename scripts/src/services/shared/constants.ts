import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const NPM_REGISTRY_URL = "https://registry.npmjs.org";

// Every script reads and writes against the repository rather than against `scripts/`. A `..` chain is what this
// Was, and it is wrong the first time the file counting it moves a directory — which it has done once already,
// One folder deeper, silently rooting every script at `scripts/`. The workspace manifest only ever sits at the
// Root, so walking up to it is an answer that survives the next move.
const findRepositoryRoot = (directory: string): string => {
  if (existsSync(join(directory, "pnpm-workspace.yaml"))) return directory;
  const parent = dirname(directory);
  if (parent === directory)
    throw new InvalidOperationError(Operation.Read, "scripts", "no pnpm-workspace.yaml above this file");
  return findRepositoryRoot(parent);
};

export const REPOSITORY_ROOT: string = findRepositoryRoot(import.meta.dirname);

export const REGISTRY_FETCH_TIMEOUT_MS = 10000;
