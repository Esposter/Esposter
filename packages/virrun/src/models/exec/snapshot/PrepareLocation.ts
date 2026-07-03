// The on-disk address of a source-keyed prepare layer in the host-global cache (`~/.virrun/prepare/`), resolved from
// The lockfile hash + source-tree hash + the resolved prepare step. Pure addressing — produced before anything is
// Captured; the capture run materializes upperDir (via a temp dir it renames into place), and a fork run stacks
// UpperDir as a read-only lower above the deps snapshot so its artifacts shadow the host's source copy.
export interface PrepareLocation {
  // The prepare-layer root: `~/.virrun/prepare/<key>`.
  readonly dir: string;
  // Whether a layer has already been captured here (its upper layer exists on disk).
  readonly exists: boolean;
  // Sha256 keying this layer over lockfile + source-tree + resolved prepare step, so a source change invalidates it.
  readonly key: string;
  // Overlayfs upper the capture persists the pruned prepare outputs into, reused as a read-only lower when forking.
  readonly upperDir: string;
}
