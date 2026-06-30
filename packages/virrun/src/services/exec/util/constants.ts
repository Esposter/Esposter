/* oxlint-disable no-inferrable-types */
export const GITIGNORE_FILENAME = ".gitignore";
export const VIRRUN_CACHE_DIRECTORY_NAME = ".virrun";
export const VIRRUN_GITIGNORE_ENTRY: string = `/${VIRRUN_CACHE_DIRECTORY_NAME}/`;
export const VIRRUN_STORE_DIRECTORY_NAME = "store";
export const VIRRUN_PNPM_STORE_DIRECTORY_NAME = "pnpm";
export const VIRRUN_COREPACK_STORE_DIRECTORY_NAME = "corepack";
export const PACKAGE_JSON_FILENAME = "package.json";
export const PNPM_WORKSPACE_FILENAME = "pnpm-workspace.yaml";
export const PNPM_LOCKFILE_FILENAME = "pnpm-lock.yaml";
// The dependency-closure directory every JS package manager materialises. The one structural marker of the deps a
// Persist run must never flush to the host: node_modules is supplied by the snapshot lower, and new writes into it
// (e.g. a build's node_modules/.vite cache) have no snapshot entry of their own but still must not leak out.
export const NODE_MODULES_DIRECTORY = "node_modules";
// Repo-root config (specs/config-and-cache.md): selects which backend a sandboxed command runs through.
// Resolved by walking up from cwd; absent = the backend defaults to auto (native today).
export const VIRRUN_CONFIGURATION_FILENAME = "virrun.config.json";
// The `$schema` pointer `virrun init` writes into a generated config: the published schema.json resolved from the
// Consumer's installed package, so editors render its field docs/enums on hover (the oxlint `$schema` pattern).
export const VIRRUN_SCHEMA_RELATIVE_PATH: string = "./node_modules/virrun/schema.json";

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
// The source tree's node_modules (the Windows host's, on win32) shows through the overlay lower, so a sandbox
// `pnpm install` wants to purge the mismatched modules dir before reinstalling — and with no TTY it aborts asking
// For confirmation (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). The capture is non-interactive and the purge
// Lands in the overlay upper (never the real source), so run the install in CI mode: pnpm treats `CI=true` as a
// Plain env signal (not a `PNPM_CONFIG_*` setting) to skip every confirmation prompt, which the per-setting
// `confirmModulesPurge` override does not reliably do for a workspace purge.
export const CI_ENV_KEY = "CI";
export const CI_ENV_VALUE = "true";

export const VIRRUN_TEMP_DIR_PREFIX = "virrun-temp-";
