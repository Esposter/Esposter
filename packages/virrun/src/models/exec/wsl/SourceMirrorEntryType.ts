// What a working-tree entry is in a source-mirror manifest (buildSourceMirrorManifest). The type is part of the
// Change signature: an entry whose type flipped (file → directory, file → symlink, …) must be deleted from the mirror
// Before rsync recreates it, so diffSourceMirrorManifests puts it in both the delete and copy sets.
export enum SourceMirrorEntryType {
  Directory = "directory",
  File = "file",
  Symlink = "symlink",
}
