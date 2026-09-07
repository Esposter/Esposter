// Whether a snapshot carries its own copy of the assets its content references, which is the expensive half
// Of taking one and the only axis that legitimately parameterizes the shared paths
export enum SnapshotKind {
  // Content plus a clone of every referenced asset, urls rewritten to the clones. Survives the working copy
  // Deleting or replacing an asset, and costs one storage round trip per referenced asset
  Immutable = "Immutable",
  // Content only, urls left pointing at the live `{id}/files/…`. One blob, and an asset the owner deletes is
  // Gone from it (/docs/platform/resource-snapshots)
  Reference = "Reference",
}
