// The staged result of createSourceMirrorArchive: the pid-tagged archive filename the sync script extracts into
// `tree/`, plus the copy paths the host tar couldn't open (Windows-locked files). Unreadable paths are absent from
// The archive and pruned from the published manifest, so later runs retry them until readable.
export interface SourceMirrorArchive {
  readonly archiveFilename: string;
  readonly unreadablePaths: readonly string[];
}
