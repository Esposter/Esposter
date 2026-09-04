/* oxlint-disable typescript/no-inferrable-types */

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
// The repo's own git dir — host-owned working state the source mirror keeps out of the sandbox
// (resolveMirrorExcludes) and the write-back therefore masks. Named here rather than spelled inline, so the two
// Directions and their tests can never disagree on the spelling.
export const GIT_DIRECTORY = ".git";
// Marks an exclude pattern as naming ONE place in the tree rather than a segment at any depth (checkIsBareNameExclude).
// Kept a valid relative path so a consumer that spends the pattern as one still resolves inside the tree.
export const ROOT_ANCHOR_PREFIX = "./";
// Git's registry of linked worktrees under the common git dir: one `worktrees/<name>/gitdir` file per worktree,
// Holding the absolute path of that worktree's own `.git` file. A `.git` that is a file rather than a directory
// Points back at its entry with the same `gitdir: ` prefix. Read by readLinkedWorktreePaths to derive which nested
// Directories are parallel checkouts rather than this tree's source — the generic form of "don't mirror a worktree".
export const GIT_WORKTREES_DIRECTORY_NAME = "worktrees";
export const GIT_WORKTREE_GITDIR_FILENAME = "gitdir";
export const GIT_WORKTREE_GITDIR_PREFIX = "gitdir: ";
// Git's own record of where a git dir's common dir is, written into every linked worktree's git dir (`../..`, or an
// Absolute path). Its ABSENCE is equally a fact: a git dir that is not a worktree entry — a submodule's
// `.git/modules/<name>` — is its own common dir. Reading it is what keeps readGitCommonDirectory from inferring the
// Answer from the path's shape, which only holds for the `worktrees/<name>` layout.
export const GIT_COMMON_DIRECTORY_FILENAME = "commondir";
// The dir pnpm/npm link executables into; prepended to the sandbox PATH so a bare command resolves the overlaid
// (current-platform) binary ahead of any host `.bin` the WSL login PATH leaks in. See createOsExecOptions.
export const NODE_MODULES_BIN_DIRECTORY: string = `${NODE_MODULES_DIRECTORY}/.bin`;
// Repo-root config selecting which backend a sandboxed command runs through; absent means auto (native today).
// The extensionless base name unconfig searches; the extensions below are the per-directory candidate order.
export const VIRRUN_CONFIGURATION_NAME = "virrun.config";
// Precedence within a directory level: a TS config (the platform-branching form) wins over the JSON variant.
export const VIRRUN_CONFIGURATION_EXTENSIONS = ["ts", "mts", "js", "mjs", "json"] as const;
// The JSON variant `virrun init` writes (schema-backed via $schema; TS configs are typed instead).
export const VIRRUN_CONFIGURATION_FILENAME: string = `${VIRRUN_CONFIGURATION_NAME}.json`;
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
// Windows-side files caching the win32 WSL environment probes so a fresh `virrun -- <cmd>` process reuses them
// Instead of re-spawning wsl.exe (an interactive-login shell for the PATH, two round-trips for the cache root).
// Stored via getLocalCacheDirectory (the Windows `~`), not the WSL-ext4 cache root. See readWslEnvironmentCache.
export const WSL_LOGIN_ENVIRONMENT_CACHE_FILENAME = "wsl-login-environment.json";
export const WSL_CACHE_ROOT_CACHE_FILENAME = "wsl-cache-root.json";
// How long any persisted probe verdict stays reusable — a captured WSL environment, the os-backend capability
// Verdict. The host fingerprint (platform + kernel release) can't see what these actually depend on: switching the
// Node manager's active version rewrites neither, and neither does WSL being cold when the capability probe timed
// Out. Without an expiry, a capture taken before a node upgrade pins the sandbox to the old node forever and a
// Timed-out probe degrades every later run to the native backend, both silently, until a manual `cache clean`. The
// Window trades one probe spawn per interval for drift that self-heals the same day.
export const PROBE_CACHE_MAX_AGE_MS: number = Temporal.Duration.from({ hours: 6 }).total("milliseconds");
// Set (to any value) to bypass the persisted capability cache and force a fresh probe — the escape hatch for a host
// Whose bubblewrap/kernel capability changed without a cache-key change (e.g. bwrap was just installed).
export const VIRRUN_FORCE_PROBE_KEY = "VIRRUN_FORCE_PROBE";
// Set (to any value) to disable the task cache for a run — the env form of `virrun --no-cache`. See isTaskCacheEnabled.
export const VIRRUN_NO_CACHE_KEY = "VIRRUN_NO_CACHE";
// Set (to any value) to print internal diagnostic lines to stderr — the env form of `virrun run --debug`. The
// Observability lever for silently-degrading paths (the task cache is best-effort: a failed record leaves the run
// Correct, merely uncached, so only these lines reveal why a run didn't cache). See writeVirrunDebug.
export const VIRRUN_DEBUG_KEY = "VIRRUN_DEBUG";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_KEY = "PNPM_CONFIG_PACKAGE_IMPORT_METHOD";
export const PNPM_CONFIG_PACKAGE_IMPORT_METHOD_VALUE = "copy";
export const PNPM_CONFIG_STORE_DIR_KEY = "PNPM_CONFIG_STORE_DIR";
// The pnpm verify-deps-before-run check makes `pnpm run`/`pnpm exec` fire an auto-install the moment it
// Decides node_modules is out of sync with the lockfile. Inside the sandbox node_modules comes frozen from
// The snapshot lower, so that check both misfires (the overlay's merged tree never matches pnpm's on-disk
// Expectation) and, when it installs, pacquet dies writing bin shims into the overlay upper
// (ENOENT node_modules/.bin/*). Disable it so a sandboxed pnpm only runs the command over the frozen deps
// And never re-installs them — the prepare step (`pnpm exec nuxt prepare`) is the hot path.
export const PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_KEY = "PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN";
export const PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN_VALUE = "false";
// The host's node_modules shows through the overlay lower, so a sandbox `pnpm install` wants to purge it and, with
// No TTY, aborts for confirmation (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). `CI=true` skips that prompt.
export const CI_ENV_KEY = "CI";
export const CI_ENV_VALUE = "true";
// Upper bound for a synchronous capability probe's child process. bwrap running `true` and the wsl.exe round-trips
// Are sub-second on a healthy host; a corrupt/unresponsive WSL distro can hang execFileSync forever, so the cap lets
// The probe fail (degrade to unsupported) instead of blocking the whole CLI.
export const PROBE_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
// Upper bound for a wsl.exe round-trip (execWsl). Sized apart from the in-process probe cap because the first call
// After a shutdown boots the distro before it runs anything — measured at ~7.5s on a healthy host, so the probe cap
// Leaves no margin at all, and a machine merely busy enough to cross it turns a cold boot into a "this host cannot
// Sandbox" verdict. The bound still exists only as a hang guard for a wedged WSL service, which never answers at all.
export const WSL_PROBE_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
// Upper bound for a synchronous WSL-side `rm -rf` of a cache dir (removeSnapshotDirectory). Real work — an
// Unlink of a whole node_modules closure — so it gets minutes rather than the probe's seconds, and its size is
// Bounded by one cache entry rather than by what the run did. The bound exists only so a wedged WSL service or 9p bridge fails
// The call instead of blocking the CLI forever, which is exactly how an unbounded execFileSync presents: a run that
// Never returns and no error to explain it. See [subprocess timeouts](/docs/virrun/subprocess-timeouts).
export const WSL_WORK_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// Upper bound for the write-back's overlay python program (runOverlayScript). Sized apart from the work cap because
// This is the one bound whose work scales with the run rather than with a cache entry: the diff copied back is
// Whatever the command wrote, so a cold `pnpm install` moves a whole node_modules across the 9p bridge. Sharing the
// Work cap SIGTERMs that copy partway and reports failure for a command that succeeded, so the bound is sized for
// The largest realistic diff and still exists only as a hang guard.
export const OVERLAY_WRITE_BACK_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 30 }).total("milliseconds");
// The bound `cache clean` removes its roots under: none (0 is execFileSync's own "no timeout"). The work cap is sized
// For one cache entry, while a clean unlinks the entire cache — tens of GB of small files on WSL ext4 routinely runs
// Past five minutes, and a SIGTERM mid-`rm -rf` leaves a half-swept cache and no record of which roots survived. The
// Bound exists to stop a wedged WSL service hanging an implicit background prune; a clean is explicit and
// User-invoked, so it may block until it finishes and the user may Ctrl+C it.
export const CACHE_CLEAN_TIMEOUT_MS: number = 0;
// How old a source-mirror entry carrying no `origin` marker must be before the reaper may reclaim it. The marker is
// Written (atomically) as soon as the entry dir exists, so its absence means a sync died in that same instant — a
// Corpse, not a live planner — and any window measured in a day is orders of magnitude beyond that gap. Without this
// The unmarked corpses are unattributable and accumulate forever: a test suite that runs virrun in temp dirs strands
// One per aborted run, hundreds of them holding gigabytes of ext4.
export const SOURCE_MIRROR_UNMARKED_MAX_AGE_MS: number = Temporal.Duration.from({ days: 1 }).total("milliseconds");
// Minimum age before a dead owner's staged remove-list may be reclaimed. A dead owner does NOT mean the teardown is
// Finished with the file: `spawnBackground` spawns asynchronously, and `wsl.exe` still has to start the WSL relay and
// `sh` before the script's `< "$1"` redirect opens it — so a short win32 run can exit, and its pid read as dead, while
// Its own teardown is still cold-starting. Unlinking then leaves that `sh` with a missing input, its `rm -rf` never
// Runs, and the superseded snapshot dirs it named are never reclaimed — the unbounded ext4 growth the batched sweep
// Exists to prevent, silently, since the spawn ignores its stdio and has no exit handler.
export const REMOVE_LIST_REAP_MINIMUM_AGE_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// Minimum age (`ps -o etimes`) before the startup orphan sweep may judge a marker-matched process. Every transient
// Misread window lasts milliseconds — a fork that hasn't exec'd yet (its cmdline still carries the parent's marker),
// A spawning run whose Relay parent isn't established, a finishing run whose Relay died first — while a true corpse
// Sits orphaned until the next virrun startup, so a short floor removes the races without delaying real reaps.
// Seconds, not ms: the consumer is a Linux shell `[ -ge ]` against etimes.
export const ORPHAN_REAP_MINIMUM_AGE_SECONDS: number = Temporal.Duration.from({ seconds: 10 }).total("seconds");
// Upper bound the folded sync script enforces Linux-side — `flock -w` on the mirror lock plus `timeout` on the
// Archive extract (createWslSourceMirrorSync). A pure hang guard: the extract unpacks one staged archive already
// Sitting on ext4, seconds of local work even for a full materialize, so the bound only exists so a stalled ext4
// Volume or hung lock aborts the run instead of hanging the CLI forever. Seconds, not ms: the consumers are Linux
// Shell utilities, not execFileSync.
export const SOURCE_MIRROR_TIMEOUT_SECONDS: number = Temporal.Duration.from({ minutes: 5 }).total("seconds");
// Upper bound for the host-side `tar` staging the sync's archive (createSourceMirrorArchive): a native NTFS read of
// The copied paths plus one sequential 9p write into the mirror entry. Generous — a full materialize archives the
// Whole mirrored set — but bounded so a wedged 9p bridge fails the plan instead of hanging it. This bounds the
// Synchronous execFileSync side of the split, so milliseconds; SOURCE_MIRROR_TIMEOUT_SECONDS bounds the Linux side.
export const SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");

export const VIRRUN_TEMP_DIR_PREFIX = "virrun-temp-";
// The host cache dir acceptance corpora/snapshots stage into, under $HOME never os.tmpdir (see createWorkspaceCorpus).
export const HOME_CACHE_DIRECTORY_NAME = ".cache";
// Leaf under the home cache root isolating the heavy tests' shared warm snapshot, so global teardown removes only
// Test data and never the real cache.
export const ACCEPTANCE_CACHE_DIRECTORY_NAME = "acceptance";
