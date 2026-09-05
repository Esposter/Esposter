/* oxlint-disable typescript/no-inferrable-types */
// The `$0` we give the WSL-side `sh -c` that hosts a run's bwrap, plus a per-run suffix (createWslProcessMarker).
// It makes the run's process tree findable Linux-side by cmdline (pgrep -f) so a Ctrl+C reaper can kill its whole
// Process group without a Windows→WSL PID handoff. Kept generic ("virrun-bwrap") so it reads clearly in `ps`.
export const VIRRUN_WSL_PROCESS_MARKER = "virrun-bwrap";
// Markers bracketing each value readWslLoginEnvironment prints inside the interactive login shell, so an rc that
// Writes to stdout itself (prompts, MOTD, version-manager banners…) can't corrupt the capture — the parser slices
// Strictly between them and treats their absence as "not captured". A marker pair per value rather than one pair with
// A delimiter: neither a PATH nor a version string can contain a marker, while any in-band delimiter has to assume
// Something about the values. Shared so the capture script and the parser (and the test that reconstructs marked
// Output) never drift apart.
export const VIRRUN_LOGIN_PATH_BEGIN_MARKER = "__VIRRUN_LOGIN_PATH_BEGIN__";
export const VIRRUN_LOGIN_PATH_END_MARKER = "__VIRRUN_LOGIN_PATH_END__";
export const VIRRUN_LOGIN_NODE_BEGIN_MARKER = "__VIRRUN_LOGIN_NODE_BEGIN__";
export const VIRRUN_LOGIN_NODE_END_MARKER = "__VIRRUN_LOGIN_NODE_END__";
// Leaf under the WSL native ext4 cache root holding one per-repo source mirror (`sources/<sha256(hostCwd)>`), a
// Sibling of `snapshots/` and `tasks/`. On win32 the sandbox reads the repo source from this ext4 mirror instead of
// Straight from /mnt/c (v9fs, 15-64x slower); `cache clean --all` sweeps it. See createWslSourceMirrorSync.
export const VIRRUN_SOURCES_DIRECTORY_NAME = "sources";
// A source mirror is a self-contained entry dir (`sources/<sha256(hostCwd)>/`) like `snapshots/<hash>`: the mirrored
// Repo lives in `tree/` (so the `--overlay-src` lower stays a byte-exact copy of the working tree, unpolluted by
// Virrun metadata) beside an `origin` marker recording the host cwd it was cloned from. reapAbandonedSourceMirrors
// Reads that marker to reclaim a whole entry once its source path is gone (deleted worktree / moved repo).
export const VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME = "tree";
export const VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME = "origin";
// The manifest published beside `tree/` after every successful sync: the working tree's per-entry change signature
// (SourceMirrorManifest) at the moment it was mirrored. The next run diffs its own host-side walk against this to
// Sync only what changed — never a per-run whole-tree stat-walk over v9fs. Published last, inside the
// Sync's flock, via an atomic `mv` from a staged temp, so it never claims a state the mirror doesn't hold.
export const VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME = "manifest.json";
// Pid-tagged temp leaves (`<prefix><pid>.<uuid>`) the planner stages into the entry dir for the folded sync script to
// Consume: the next manifest and origin marker (each published via atomic `mv`), the staged tar archive of the copied
// Paths (createSourceMirrorArchive, extracted into `tree/`), and the null-delimited delete (xargs -0 rm -rf) list.
// The host pid tag is load-bearing: staging host-side keeps every temp in the Windows pid domain, so a hard-killed
// Run's corpses are reclaimed by reapStaleSourceMirrorTemps once the owner pid is dead (same lifecycle as the
// Snapshot upper temps) — a Linux-side `$$`-tagged temp would be unattributable from the host.
export const VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX: string = `${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}.`;
export const VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX: string = `${VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME}.`;
export const VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX = "archive.";
// The archive's input: the null-delimited copy-path list host `tar` reads via `-T --null`. Consumed and unlinked
// Host-side during planning — it never reaches the Linux script — but it stages under the same pid-tag convention so
// A plan that dies between write and unlink leaves a reapable corpse, not a permanent stray.
export const VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX = "copy.";
export const VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX = "delete.";
// A `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` UNC. It already points at the distro's own Linux
// Filesystem, so the path inside it is just the Linux path with backslashes (`\\wsl.localhost\<distro>\home\x` is
// `/home/x`) — the optional `linuxPath` group captures that tail for readWslPath. Doubling as a boolean guard
// (`.test`): removeSnapshotDirectory(Detached) uses it to route a WSL-ext4 snapshot's teardown through WSL rather than
// Node, since the 9p bridge identity can't chmod/remove the overlay workDir's namespaced-root scratch.
export const WSL_UNC_REGEX: RegExp = /^\\\\wsl(?:\.localhost|\$)\\[^\\]+(?<linuxPath>\\.*)?$/iu;
// Teardown run inside WSL where the distro user owns the trees: chmod each traversable, then rm -rf (idempotent, so a
// Missing dir is a no-op). Paths are passed as positional args and iterated, never interpolated into the body — a
// Cache path containing a single quote would otherwise break the quoting and inject extra shell syntax. Used by the
// Blocking single-dir teardown (removeSnapshotDirectory); a sweep of many dirs uses WSL_REMOVE_LIST_SCRIPT instead,
// Because an argv has a ceiling and a sweep's size has none.
export const WSL_REMOVE_SCRIPT = 'for dir; do chmod -R u+rwx -- "$dir" 2>/dev/null; rm -rf -- "$dir"; done';
// The same teardown driven from the null-delimited list file named by `$1` rather than from the argv, so a sweep is
// ONE wsl.exe launch however many dirs it holds: a launch is a service RPC plus a relay process, and the per-entry
// Fan-out it avoids would saturate the WSL service once enough mirrors are stranded to sweep at once, until it
// Answers every later call with Wsl/Service/E_UNEXPECTED — while an argv-sized batch would trade that for
// One launch per batch, which is the fan-out again. `xargs -0` keeps any path intact (spaces, newlines) and runs its
// `sh` invocations sequentially when it splits. The list is unlinked last, so a sweep leaves nothing behind.
//
// Unlinked with `;` rather than `&&`, deliberately. Keeping the list when the removal fails would keep a file no
// Reaper owns: nothing consumes this script's exit status (spawnBackground gives the child `stdio: "ignore"` and no
// Exit handler — fire-and-forget is the point) and nothing reads a leftover list, so it would sit there until a later
// Sweep's reapStaleRemoveLists reclaimed it on owner death. What a failed removal actually gets is re-derivation: the
// Dirs are still stale, so the next run's sweep enumerates them again and stages a fresh list. Retaining the failed
// One buys diagnostics nothing reads and leaks a file per failure. A removal
// Failure that must be surfaced goes through the blocking path instead (removeSnapshotDirectory → execWsl throws).
export const WSL_REMOVE_LIST_SCRIPT: string = `xargs -0r sh -c '${WSL_REMOVE_SCRIPT}' sh < "$1"; rm -f -- "$1"`;
// The staged list `removeSnapshotDirectoriesDetached` writes into the cache root for the script above to consume,
// Tagged with the host pid like every other virrun temp so a stray one is attributable.
export const VIRRUN_REMOVE_LIST_TEMP_PREFIX = "remove.";
