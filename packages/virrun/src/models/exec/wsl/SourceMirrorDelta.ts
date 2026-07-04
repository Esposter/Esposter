// The mirror mutation a manifest diff prescribes (diffSourceMirrorManifests): relative paths to rsync from the host
// Source (created/changed entries, plus both halves of a type flip) and relative paths to rm -rf from the mirror
// (removed entries, plus the old shape of a type flip — deletes run first so rsync recreates cleanly). Both empty
// Means the mirror is current and the sync is skipped outright.
export interface SourceMirrorDelta {
  readonly copyPaths: readonly string[];
  readonly deletePaths: readonly string[];
}
