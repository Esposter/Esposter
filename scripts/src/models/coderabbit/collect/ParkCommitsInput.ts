export interface ParkCommitsInput {
  // Why no window could carry the commits, in one line the issue leads with
  cause: string;
  cwd: string;
  isDryRun: boolean;
  shas: string[];
  viewerLogin: string;
}
