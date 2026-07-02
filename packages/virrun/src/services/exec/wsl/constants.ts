/* oxlint-disable no-inferrable-types */
// The `$0` we give the WSL-side `sh -c` that hosts a run's bwrap, plus a per-run suffix (createWslProcessMarker).
// It makes the run's process tree findable Linux-side by cmdline (pgrep -f) so a Ctrl+C reaper can kill its whole
// Process group without a Windows→WSL PID handoff. Kept generic ("virrun-bwrap") so it reads clearly in `ps`.
export const VIRRUN_WSL_PROCESS_MARKER = "virrun-bwrap";
// Leaf under the WSL native ext4 cache root holding one per-repo source mirror (`sources/<sha256(hostCwd)>`), a
// Sibling of `snapshots/` and `tasks/`. On win32 the sandbox reads the repo source from this ext4 mirror instead of
// Straight from /mnt/c (v9fs, 15-64x slower); `cache clean --all` sweeps it. See ensureWslSourceMirror.
export const VIRRUN_SOURCES_DIRECTORY_NAME = "sources";
// A `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` UNC. It already points at the distro's own Linux
// Filesystem, so the path inside it is just the Linux path with backslashes (`\\wsl.localhost\<distro>\home\x` is
// `/home/x`) — the optional `linuxPath` group captures that tail for readWslPath. Doubling as a boolean guard
// (`.test`): removeSnapshotDirectory(Detached) uses it to route a WSL-ext4 snapshot's teardown through WSL rather than
// Node, since the 9p bridge identity can't chmod/remove the overlay workDir's namespaced-root scratch.
export const WSL_UNC_REGEX: RegExp = /^\\\\wsl(?:\.localhost|\$)\\[^\\]+(?<linuxPath>\\.*)?$/iu;
// Teardown run inside WSL where the distro user owns the tree: chmod it traversable, then rm -rf (idempotent, so a
// Missing dir is a no-op). The path is passed as a positional arg ($1), never interpolated into the body — a cache
// Path containing a single quote would otherwise break the quoting and inject extra shell syntax.
export const WSL_REMOVE_SCRIPT = 'chmod -R u+rwx -- "$1" 2>/dev/null; rm -rf -- "$1"';
