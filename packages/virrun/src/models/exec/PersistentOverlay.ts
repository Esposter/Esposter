// The on-disk upper a capture or persist run writes into, and the scratch directory overlayfs requires beside it on
// The same filesystem. One object rather than two optional fields, so an upper without its work directory — which
// Overlayfs refuses — cannot be written down at all
export interface PersistentOverlay {
  // Host directory that captures writes as real files
  upperDirectory: string;
  // Empty scratch directory on the same filesystem as upperDirectory
  workDirectory: string;
}
