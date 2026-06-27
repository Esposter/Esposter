import { TEST_TEMP_DIR_PREFIX } from "@/services/exec/constants.test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// Assembles a manifest mirror of the real monorepo: symlinks the root manifests + every workspace
// Package.json into a fresh dir with NO node_modules, so a real `pnpm install` resolves the actual
// Dependency closure from a clean cold state. Lives under $HOME (NOT os.tmpdir) because the sandbox
// Masks /tmp with --tmpfs, which would hide a /tmp corpus from the command running inside. mkdtemp
// Gives every call a unique dir, so the same prefix is safe even when a bench builds two corpora.
// Shared by the os-backend acceptance test and the local-monorepo bench; a `.test.ts` so ctix keeps
// It out of the public barrel.
export const createWorkspaceCorpus = (repoRoot: string): string => {
  const cache = join(homedir(), ".cache");
  mkdirSync(cache, { recursive: true });
  const corpus = mkdtempSync(join(cache, TEST_TEMP_DIR_PREFIX));
  for (const manifest of ["package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml"])
    symlinkSync(join(repoRoot, manifest), join(corpus, manifest));
  const packages = join(repoRoot, "packages");
  mkdirSync(join(corpus, "packages"));
  for (const name of readdirSync(packages)) {
    const packageJson = join(packages, name, "package.json");
    if (!existsSync(packageJson)) continue;
    mkdirSync(join(corpus, "packages", name));
    symlinkSync(packageJson, join(corpus, "packages", name, "package.json"));
  }
  return corpus;
};

describe.todo("createWorkspaceCorpus");
