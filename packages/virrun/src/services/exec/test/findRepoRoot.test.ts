import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe } from "vitest";
// Walks up from this file until the monorepo root (the dir holding pnpm-workspace.yaml) so callers
// Mirror whatever checkout they run in, not a hard-coded path. Shared by the os-backend acceptance test
// And the local-monorepo bench; lives in a `.test.ts` so ctix keeps it out of the public barrel.
export const findRepoRoot = (): string => {
  let dir = import.meta.dirname;
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("could not locate the monorepo root (no pnpm-workspace.yaml found)");
    dir = parent;
  }
  return dir;
};

describe.todo("findRepoRoot");
