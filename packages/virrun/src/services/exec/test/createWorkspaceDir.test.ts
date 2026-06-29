import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe } from "vitest";
// A throwaway directory seeded with a pnpm lockfile, so it resolves as a workspace root — the anchor for
// Virrun's repo cache, snapshot key, and .gitignore. The single source of truth for the minimal-repo fixture
// Every unit test around the workspace-root/store/snapshot path needs; a `.test.ts` so ctix keeps it out of the
// Public barrel. Callers own cleanup (rmSync in an afterEach).
export const createWorkspaceDir = (lockfileContent = "lockfileVersion: '9.0'\n"): string => {
  const dir = createTemporaryDirectory();
  writeFileSync(join(dir, PNPM_LOCKFILE_FILENAME), lockfileContent);
  return dir;
};

describe.todo("createWorkspaceDir");
