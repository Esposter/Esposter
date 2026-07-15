// The staged result of createSourceMirrorArchive: the pid-tagged archive filename the sync script extracts into
// `tree/`, plus the copy paths the archive ended up without — a Windows-locked file the host tar couldn't open, or one
// That vanished between the manifest walk and the spawn. Unarchived paths are pruned from the published manifest, so
// It never claims a state the mirror doesn't hold and later runs retry them.
export interface SourceMirrorArchive {
  readonly archiveFilename: string;
  readonly unarchivedPaths: readonly string[];
}
