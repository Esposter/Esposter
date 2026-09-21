export interface MergeMainInput {
  // The basis the fold's attempts are counted against (`getMarker`)
  collectorSha: string;
  cwd: string;
  viewerLogin: string;
}
