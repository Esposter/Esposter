// The `$0` we give the WSL-side `sh -c` that hosts a run's bwrap, plus a per-run suffix (createWslProcessMarker).
// It makes the run's process tree findable Linux-side by cmdline (pgrep -f) so a Ctrl+C reaper can kill its whole
// Process group without a Windows→WSL PID handoff. Kept generic ("virrun-bwrap") so it reads clearly in `ps`.
export const VIRRUN_WSL_PROCESS_MARKER = "virrun-bwrap";
// Leaf under the WSL native ext4 cache root holding one per-repo source mirror (`sources/<sha256(hostCwd)>`), a
// Sibling of `snapshots/` and `tasks/`. On win32 the sandbox reads the repo source from this ext4 mirror instead of
// Straight from /mnt/c (v9fs, 15-64x slower); `cache clean --all` sweeps it. See ensureWslSourceMirror.
export const VIRRUN_SOURCES_DIRECTORY_NAME = "sources";
