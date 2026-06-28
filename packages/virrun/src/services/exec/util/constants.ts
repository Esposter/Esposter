/* oxlint-disable no-inferrable-types */
export const GITIGNORE_FILENAME = ".gitignore";
export const VIRRUN_CACHE_DIRECTORY_NAME = ".virrun";
export const VIRRUN_GITIGNORE_ENTRY: string = `/${VIRRUN_CACHE_DIRECTORY_NAME}/`;
export const VIRRUN_STORE_DIRECTORY_NAME = "store";
export const VIRRUN_PNPM_STORE_DIRECTORY_NAME = "pnpm";
export const VIRRUN_COREPACK_STORE_DIRECTORY_NAME = "corepack";
export const VIRRUN_SNAPSHOTS_DIRECTORY_NAME = "snapshots";
// Overlayfs layers of a captured snapshot, under .virrun/snapshots/<lockfile-hash>/: `upper` persists the
// Post-install writes (and doubles as a read-only lower when forking), `work` is the empty scratch dir
// Overlayfs requires alongside a writable upper.
export const VIRRUN_SNAPSHOT_UPPER_DIRECTORY_NAME = "upper";
export const VIRRUN_SNAPSHOT_WORK_DIRECTORY_NAME = "work";
export const PNPM_LOCKFILE_FILENAME = "pnpm-lock.yaml";
// Repo-root config (specs/config-and-cache.md): selects which backend a sandboxed command runs through.
// Resolved by walking up from cwd; absent = the backend defaults to auto (native today).
export const VIRRUN_CONFIGURATION_FILENAME = "virrun.config.json";

// The presence signal virrun injects into every command's environment (value `true`), the way vitest sets
// `VITEST` and CI sets `CI`: it lets the running command — and its tests, configs, tooling — detect that it is
// Executing under virrun and branch on it (e.g. skip a test that needs real host disk). It is an output virrun
// Sets, not an input the user sets: opting a command in or out is done by adding/removing the `virrun -- `
// Prefix, never by toggling this. It means "running under virrun", true for any backend incl. the native
// Fallback — not "sandboxed/isolated" (that would be a separate signal, the backend name).
export const VIRRUN_ENV_KEY = "VIRRUN";

export const COREPACK_HOME_KEY = "COREPACK_HOME";
// Overrides the host-global cache root (default ~/.virrun) — lets CI and tests point the snapshot cache at
// A disposable directory instead of polluting the real home.
export const VIRRUN_CACHE_HOME_KEY = "VIRRUN_CACHE_HOME";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY = "PNPM_CONFIG_PACKAGE_IMPORT_METHOD";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE = "copy";
export const PNPM_CONFIG_STORE_DIR_KEY = "PNPM_CONFIG_STORE_DIR";

export const VIRRUN_TEMP_DIR_PREFIX = "virrun-temp-";
