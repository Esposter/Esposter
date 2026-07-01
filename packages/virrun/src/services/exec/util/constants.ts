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
// The dependency-closure dir every package manager materialises. The persist flush must never leak it: it comes
// From the snapshot lower, and writes into it (e.g. node_modules/.vite) must not reach the host.
export const NODE_MODULES_DIRECTORY = "node_modules";
// Repo-root config selecting which backend a sandboxed command runs through; absent means auto (native today).
export const VIRRUN_CONFIGURATION_FILENAME = "virrun.config.json";
// Resolved from the consumer's installed package so editors render the config's field docs on hover.
export const VIRRUN_SCHEMA_RELATIVE_PATH: string = "./node_modules/virrun/schema.json";

// Signals to the running command that it is executing under virrun. Set by virrun (toggle via the `virrun -- `
// Prefix, not this), and true for any backend including the native fallback — so it means "running under virrun",
// Not "sandboxed".
export const VIRRUN_ENV_KEY = "VIRRUN";

export const COREPACK_HOME_KEY = "COREPACK_HOME";
// Lets CI and tests point the snapshot cache at a disposable dir instead of the real home.
export const VIRRUN_CACHE_HOME_KEY = "VIRRUN_CACHE_HOME";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY = "PNPM_CONFIG_PACKAGE_IMPORT_METHOD";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE = "copy";
export const PNPM_CONFIG_STORE_DIR_KEY = "PNPM_CONFIG_STORE_DIR";
// The host's node_modules shows through the overlay lower, so a sandbox `pnpm install` wants to purge it and, with
// No TTY, aborts for confirmation (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). The purge only lands in the overlay
// Upper, so run in CI mode: `CI=true` is the signal pnpm honours to skip prompts where `confirmModulesPurge` does
// Not reliably cover a workspace purge.
export const CI_ENV_KEY = "CI";
export const CI_ENV_VALUE = "true";

export const VIRRUN_TEMP_DIR_PREFIX = "virrun-temp-";
// The host cache dir acceptance corpora/snapshots stage into, under $HOME never os.tmpdir (see createWorkspaceCorpus
// For why). Non-test so the non-test vitest global teardown can resolve the shared cache home without it.
export const HOME_CACHE_DIRECTORY_NAME = ".cache";
// Leaf under the WSL-native/home cache root that isolates the heavy tests' shared warm snapshot, so global teardown
// Removes only test data and never the real cache. Non-test so the vitest global teardown can resolve it.
export const ACCEPTANCE_CACHE_DIRECTORY_NAME = "acceptance";
