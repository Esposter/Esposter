export interface ReleaseStateInput {
  cwd: string;
  developSha: string;
  mainSha: string;
  // The open release pull request; none means the last one merged and the next window is still filling
  pullRequest?: number;
}
