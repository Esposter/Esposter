/* oxlint-disable no-inferrable-types */
import { dayjs } from "@/services/dayjs";

export const GITIGNORE_FILENAME = ".gitignore";
export const VIRRUN_CACHE_DIRECTORY_NAME = ".virrun";
export const VIRRUN_GITIGNORE_ENTRY: string = `/${VIRRUN_CACHE_DIRECTORY_NAME}/`;
export const VIRRUN_STORE_DIRECTORY_NAME = "store";
export const VIRRUN_PNPM_STORE_DIRECTORY_NAME = "pnpm";
export const VIRRUN_COREPACK_STORE_DIRECTORY_NAME = "corepack";
export const PACKAGE_JSON_FILENAME = "package.json";
export const PNPM_WORKSPACE_FILENAME = "pnpm-workspace.yaml";
export const PNPM_LOCKFILE_FILENAME = "pnpm-lock.yaml";
// The dependency-closure dir. The persist flush must never leak it: it comes from the snapshot lower, and writes
// Into it (e.g. node_modules/.vite) must not reach the host.
export const NODE_MODULES_DIRECTORY = "node_modules";
// Repo-root config selecting which backend a sandboxed command runs through; absent means auto (native today).
export const VIRRUN_CONFIGURATION_FILENAME = "virrun.config.json";
// Resolved from the consumer's installed package so editors render the config's field docs on hover.
export const VIRRUN_SCHEMA_RELATIVE_PATH: string = "./node_modules/virrun/schema.json";

// Signals to the running command that it is executing under virrun — true for any backend including the native
// Fallback, so it means "running under virrun", not "sandboxed".
export const VIRRUN_ENV_KEY = "VIRRUN";

export const COREPACK_HOME_KEY = "COREPACK_HOME";
// Lets CI and tests point the snapshot cache at a disposable dir instead of the real home.
export const VIRRUN_CACHE_HOME_KEY = "VIRRUN_CACHE_HOME";
// Host-global file caching the os-backend capability probe's verdict so a fresh `virrun -- <cmd>` process reuses it
// Instead of re-spawning the bwrap probe every command. See isOsBackendSupported.
export const CAPABILITY_CACHE_FILENAME = "capability.json";
// Windows-side files caching the win32 WSL environment probes so a fresh `virrun -- <cmd>` process reuses them instead
// Of re-spawning wsl.exe (an interactive-login shell for the PATH, two round-trips for the cache root). Stored via
// GetLocalCacheDirectory (the Windows `~`), not the WSL-ext4 cache root. See readWslEnvironmentCache.
export const WSL_LOGIN_PATH_CACHE_FILENAME = "wsl-login-path.json";
export const WSL_CACHE_ROOT_CACHE_FILENAME = "wsl-cache-root.json";
// Set (to any value) to bypass the persisted capability cache and force a fresh probe — the escape hatch for a host
// Whose bubblewrap/kernel capability changed without a cache-key change (e.g. bwrap was just installed).
export const VIRRUN_FORCE_PROBE_KEY = "VIRRUN_FORCE_PROBE";
// Set (to any value) to disable the task cache for a run — the env form of `virrun --no-cache`. See isTaskCacheEnabled.
export const VIRRUN_NO_CACHE_KEY = "VIRRUN_NO_CACHE";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY = "PNPM_CONFIG_PACKAGE_IMPORT_METHOD";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE = "copy";
export const PNPM_CONFIG_STORE_DIR_KEY = "PNPM_CONFIG_STORE_DIR";
// The host's node_modules shows through the overlay lower, so a sandbox `pnpm install` wants to purge it and, with
// No TTY, aborts for confirmation (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). `CI=true` skips that prompt.
export const CI_ENV_KEY = "CI";
export const CI_ENV_VALUE = "true";

// Upper bound for a synchronous capability probe's child process. bwrap running `true` and the wsl.exe round-trips
// Are sub-second on a healthy host; a corrupt/unresponsive WSL distro can hang execFileSync forever, so the cap lets
// The probe fail (degrade to unsupported) instead of blocking the whole CLI.
export const PROBE_TIMEOUT_MS: number = dayjs.duration(10, "seconds").asMilliseconds();

export const VIRRUN_TEMP_DIR_PREFIX = "virrun-temp-";
// The host cache dir acceptance corpora/snapshots stage into, under $HOME never os.tmpdir (see createWorkspaceCorpus).
export const HOME_CACHE_DIRECTORY_NAME = ".cache";
// Leaf under the home cache root isolating the heavy tests' shared warm snapshot, so global teardown removes only
// Test data and never the real cache.
export const ACCEPTANCE_CACHE_DIRECTORY_NAME = "acceptance";
