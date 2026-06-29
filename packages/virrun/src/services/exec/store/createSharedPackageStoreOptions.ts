import type { ExecOptions } from "@/models/exec/ExecOptions";

import {
  GITIGNORE_FILENAME,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ensureGitIgnoreEntry = (workspaceRoot: string) => {
  const gitignore = join(workspaceRoot, GITIGNORE_FILENAME);
  const gitignoreContent = existsSync(gitignore) ? readFileSync(gitignore, "utf8") : "";
  // Idempotent against any form the cache dir is already ignored under — `.virrun`, `/.virrun`, `.virrun/`,
  // `/.virrun/` — by normalizing each line to its bare name. Matching only the exact `/.virrun/` entry would
  // Re-append a redundant line whenever a repo already lists the dir in a different (equally valid) form.
  const isIgnored = gitignoreContent
    .split(/\r?\n/u)
    .some((line) => line.trim().replace(/^\/+/u, "").replace(/\/+$/u, "") === VIRRUN_CACHE_DIRECTORY_NAME);
  if (isIgnored) return;
  appendFileSync(
    gitignore,
    `${gitignoreContent.endsWith("\n") || gitignoreContent === "" ? "" : "\n"}${VIRRUN_GITIGNORE_ENTRY}\n`,
  );
};

export const createSharedPackageStoreOptions = (cwd: string): Pick<ExecOptions, "bindDirs" | "env"> => {
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  const storeDir = join(
    getRepoCacheDirectory(workspaceRoot),
    VIRRUN_STORE_DIRECTORY_NAME,
    VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  );
  mkdirSync(storeDir, { recursive: true });
  ensureGitIgnoreEntry(workspaceRoot);
  return {
    bindDirs: [storeDir],
    // For pnpm 10+, `npm_config_*` env vars are no longer read; settings are overridden via `PNPM_CONFIG_*`
    // (uppercased setting name). The copy import method is required because hardlinks can't cross from
    // The on-disk store into the RAM overlay; the store dir points writes at the bind-mounted host cache.
    env: {
      [PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY]: PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
      [PNPM_CONFIG_STORE_DIR_KEY]: storeDir,
    },
  };
};
