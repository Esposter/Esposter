export interface OpenReleaseInput {
  cwd: string;
  // The `develop` head the pull request is opened at — the sha this run pushed, or the one it found already there
  developSha: string;
  isDryRun: boolean;
  mainSha: string;
}
