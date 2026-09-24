export interface FoldReleaseInput {
  collectorSha: string;
  cwd: string;
  // The head the clean review covers, and the lease the fold's push is refused against if `develop` left it
  developSha: string;
  isDryRun: boolean;
  mainSha: string;
  viewerLogin: string;
}
