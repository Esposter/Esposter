import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { ensureGitIgnoreEntry } from "#src/services/exec/store/ensureGitIgnoreEntry";
import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY,
  PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "#src/services/exec/util/constants";
import { resolveWorkspaceRoot } from "#src/services/exec/util/resolveWorkspaceRoot";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
// `cacheRoot` is the `.virrun` directory the store lives under — the repo's own on Linux, but the WSL distro's
// Ext4 home on win32 (see getWslNativeCacheRoot), since the repo path resolves to slow v9fs inside the sandbox.
// The caller (createVirrun) owns that platform decision so this stays a pure function of its inputs.
export const createSharedPackageStoreOptions = (
  cwd: string,
  cacheRoot: string,
): Pick<ExecOptions, "bindDirectories" | "env"> => {
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  const storeDirectory = join(cacheRoot, VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_PNPM_STORE_DIRECTORY_NAME);
  mkdirSync(storeDirectory, { recursive: true });
  // Only touch the repo's .gitignore when the store actually lives inside the repo cache (`<root>/.virrun`). On
  // Win32 the os backend routes the cache to the WSL distro's ext4 home, so nothing is ever created under the
  // Repo — rewriting its .gitignore there would leave a spurious, persistent change for a directory that never exists.
  if (cacheRoot === join(workspaceRoot, VIRRUN_CACHE_DIRECTORY_NAME)) ensureGitIgnoreEntry(workspaceRoot);
  return {
    bindDirectories: [storeDirectory],
    // For pnpm 10+, `npm_config_*` env vars are no longer read; settings are overridden via `PNPM_CONFIG_*`
    // (uppercased setting name). The copy import method is required because hardlinks can't cross from
    // The on-disk store into the RAM overlay; the store directory points writes at the bind-mounted host cache.
    env: {
      [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
      [PNPM_CONFIG_STORE_DIR_KEY]: storeDirectory,
      [PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY]: PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE,
    },
  };
};
