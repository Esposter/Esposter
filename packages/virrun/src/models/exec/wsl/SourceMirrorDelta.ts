// The mirror mutation a manifest diff prescribes (diffSourceMirrorManifests): relative paths to archive from the host
// Source (created/changed entries, plus both halves of a type flip) and relative paths to rm -rf from the mirror
// (removed entries, plus the old shape of a type flip — deletes run first so the extract recreates cleanly). Both
// Empty means the mirror is current and the sync is skipped outright.
export interface SourceMirrorDelta {
  readonly copyPaths: readonly string[];
  readonly deletePaths: readonly string[];
}
