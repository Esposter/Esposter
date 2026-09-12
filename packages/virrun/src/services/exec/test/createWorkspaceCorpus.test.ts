import { PACKAGES_DIRECTORY } from "#src/services/exec/test/constants.test";
import { createHomeCacheTemporaryDirectory } from "#src/services/exec/test/createHomeCacheTemporaryDirectory.test";
import {
  PACKAGE_JSON_FILENAME,
  PNPM_LOCKFILE_FILENAME,
  PNPM_WORKSPACE_FILENAME,
} from "#src/services/exec/util/constants";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe } from "vitest";
// Assembles a manifest mirror of the real monorepo: copies the root manifests + every workspace package.json
// Into a fresh directory with NO node_modules, so a real `pnpm install` resolves the actual closure from a cold state.
//
// Copies, not symlinks: on win32 the corpus reaches the sandbox through the WSL source mirror, whose archive is
// Staged by the host's `tar`, and that strips the drive letter from an absolute NTFS symlink target — so
// `C:\repo\package.json` arrives inside the guest as `/c/repo/package.json` and every manifest dangles
// (ERR_PNPM_NO_PKG_MANIFEST). Manifests are small and few, so copying costs nothing and keeps the fixture
// Platform-agnostic.
export const createWorkspaceCorpus = (repositoryRoot: string): string => {
  const corpus = createHomeCacheTemporaryDirectory();
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
