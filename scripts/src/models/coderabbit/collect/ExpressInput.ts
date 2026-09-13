export interface ExpressInput {
  cwd: string;
  // The lane runs only where this equals `mainSha`: an unreviewed window sitting on develop would merge back
  // Into a `main` the express commits have already moved under it
  developSha: string;
  mainSha: string;
  queueSha: string;
}
