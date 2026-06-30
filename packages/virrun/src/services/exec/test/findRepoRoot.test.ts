import { PNPM_WORKSPACE_FILENAME } from "@/services/exec/util/constants";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe } from "vitest";
// Walks up from this file to the monorepo root (the dir holding pnpm-workspace.yaml) so callers mirror whatever
// Checkout they run in, not a hard-coded path.
export const findRepoRoot = (): string => {
  let dir = import.meta.dirname;
  while (!existsSync(join(dir, PNPM_WORKSPACE_FILENAME))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`could not locate the monorepo root (no ${PNPM_WORKSPACE_FILENAME} found)`);
    dir = parent;
  }
  return dir;
};

describe.todo("findRepoRoot");
