export interface FoldReleaseInput {
  collectorSha: string;
  cwd: string;
  // The head the review covers
  developSha: string;
  isDryRun: boolean;
  // The lease the fold's push is refused against if `main` left it
  mainSha: string;
  viewerLogin: string;
}
