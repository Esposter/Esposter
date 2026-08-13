import { PNPM_WORKSPACE_FILENAME } from "@/services/exec/util/constants";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe } from "vitest";
// Walks up from this file to the monorepo root (the dir holding pnpm-workspace.yaml) so callers mirror whatever
// Checkout they run in, not a hard-coded path.
export const findRepoRoot = (): string => {
  let directory = import.meta.dirname;
  while (!existsSync(join(directory, PNPM_WORKSPACE_FILENAME))) {
    const parent = dirname(directory);
    if (parent === directory)
      throw new Error(`could not locate the monorepo root (no ${PNPM_WORKSPACE_FILENAME} found)`);
    directory = parent;
  }
  return directory;
};

describe.todo("findRepoRoot");
