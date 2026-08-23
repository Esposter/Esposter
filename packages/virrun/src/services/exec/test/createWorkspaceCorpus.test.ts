import { PACKAGES_DIRECTORY } from "#src/services/exec/test/constants.test";
import {
  HOME_CACHE_DIRECTORY_NAME,
  PACKAGE_JSON_FILENAME,
  PNPM_LOCKFILE_FILENAME,
  PNPM_WORKSPACE_FILENAME,
  VIRRUN_TEMP_DIR_PREFIX,
} from "#src/services/exec/util/constants";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// Assembles a manifest mirror of the real monorepo: copies the root manifests + every workspace package.json
// Into a fresh dir with NO node_modules, so a real `pnpm install` resolves the actual closure from a cold state.
// Under $HOME (NOT os.tmpdir) because the sandbox masks /tmp with --tmpfs, which would hide a /tmp corpus from the
// Command running inside — the reason every acceptance corpus/cache home is staged under $HOME.
//
// Copies, not symlinks: on win32 the corpus reaches the sandbox through the WSL source mirror, whose archive is
// Staged by the host's `tar`, and that strips the drive letter from an absolute NTFS symlink target — so
// `C:\repo\package.json` arrives inside the guest as `/c/repo/package.json` and every manifest dangles
// (ERR_PNPM_NO_PKG_MANIFEST). Manifests are small and few, so copying costs nothing and keeps the fixture
// Platform-agnostic.
export const createWorkspaceCorpus = (repositoryRoot: string): string => {
  const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
  mkdirSync(cache, { recursive: true });
  const corpus = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
  for (const manifest of [PACKAGE_JSON_FILENAME, PNPM_WORKSPACE_FILENAME, PNPM_LOCKFILE_FILENAME])
    copyFileSync(join(repositoryRoot, manifest), join(corpus, manifest));
  const packages = join(repositoryRoot, PACKAGES_DIRECTORY);
  mkdirSync(join(corpus, PACKAGES_DIRECTORY));
  for (const name of readdirSync(packages)) {
    const packageJson = join(packages, name, PACKAGE_JSON_FILENAME);
    if (!existsSync(packageJson)) continue;
    mkdirSync(join(corpus, PACKAGES_DIRECTORY, name));
    copyFileSync(packageJson, join(corpus, PACKAGES_DIRECTORY, name, PACKAGE_JSON_FILENAME));
  }
  return corpus;
};

describe.todo("createWorkspaceCorpus");
