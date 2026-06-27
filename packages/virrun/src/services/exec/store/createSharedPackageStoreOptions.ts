import type { ExecOptions } from "@/models/exec/ExecOptions";

import {
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY,
  PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE,
  PNPM_CONFIG_STORE_DIR_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_GITIGNORE_ENTRY,
  VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ensureGitIgnoreEntry = (cwd: string) => {
  const gitignore = join(cwd, ".gitignore");
  const gitignoreContent = existsSync(gitignore) ? readFileSync(gitignore, "utf8") : "";
  if (gitignoreContent.split(/\r?\n/u).includes(VIRRUN_GITIGNORE_ENTRY)) return;
  appendFileSync(
    gitignore,
    `${gitignoreContent.endsWith("\n") || gitignoreContent === "" ? "" : "\n"}${VIRRUN_GITIGNORE_ENTRY}\n`,
  );
};

export const createSharedPackageStoreOptions = (cwd: string): Pick<ExecOptions, "bindDirs" | "env"> => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const storeDir = join(
    dir,
    VIRRUN_CACHE_DIRECTORY_NAME,
    VIRRUN_STORE_DIRECTORY_NAME,
    VIRRUN_PNPM_STORE_DIRECTORY_NAME,
  );
  mkdirSync(storeDir, { recursive: true });
  ensureGitIgnoreEntry(dir);
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
