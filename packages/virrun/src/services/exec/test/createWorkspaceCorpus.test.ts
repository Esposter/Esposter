import { PACKAGES_DIRECTORY } from "@/services/exec/test/constants.test";
import {
  PACKAGE_JSON_FILENAME,
  PNPM_LOCKFILE_FILENAME,
  PNPM_WORKSPACE_FILENAME,
  VIRRUN_TEMP_DIR_PREFIX,
} from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, symlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// Assembles a manifest mirror of the real monorepo: symlinks the root manifests + every workspace package.json
// Into a fresh dir with NO node_modules, so a real `pnpm install` resolves the actual closure from a cold state.
// Under $HOME (NOT os.tmpdir) because the sandbox masks /tmp with --tmpfs, which would hide a /tmp corpus from the
// Command running inside — the reason every acceptance corpus/cache home is staged under $HOME.
export const createWorkspaceCorpus = (repoRoot: string): string => {
  const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
  mkdirSync(cache, { recursive: true });
  const corpus = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
  for (const manifest of [PACKAGE_JSON_FILENAME, PNPM_WORKSPACE_FILENAME, PNPM_LOCKFILE_FILENAME])
    symlinkSync(join(repoRoot, manifest), join(corpus, manifest));
  const packages = join(repoRoot, PACKAGES_DIRECTORY);
  mkdirSync(join(corpus, PACKAGES_DIRECTORY));
  for (const name of readdirSync(packages)) {
    const packageJson = join(packages, name, PACKAGE_JSON_FILENAME);
    if (!existsSync(packageJson)) continue;
    mkdirSync(join(corpus, PACKAGES_DIRECTORY, name));
    symlinkSync(packageJson, join(corpus, PACKAGES_DIRECTORY, name, PACKAGE_JSON_FILENAME));
  }
  return corpus;
};

describe.todo("createWorkspaceCorpus");
