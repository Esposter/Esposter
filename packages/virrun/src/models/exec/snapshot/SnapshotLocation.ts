// The on-disk address of a warm snapshot in the host-global cache (`~/.virrun/snapshots/`), resolved from the
// Lockfile hash. Pure addressing — produced by resolveSnapshotLocation before anything is captured; the
// Capture run materializes upperDirectory (via a temp directory it then renames into place), and a fork run stacks
// That `upperDirectory` as a read-only lower.
export interface SnapshotLocation {
  // The snapshot root: `~/.virrun/snapshots/<lockfile-hash>`.
  readonly directory: string;
  // Whether a snapshot has already been captured here (its upper layer exists on disk).
  readonly exists: boolean;
  // Sha256 of the lockfile that keys this snapshot, so a dependency change invalidates exactly this entry.
  readonly hash: string;
  // Overlayfs upper a capture run persists post-install writes into, reused as a read-only lower when forking.
  readonly upperDirectory: string;
}
