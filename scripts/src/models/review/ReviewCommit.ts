// A commit owed a review, with the repository-relative paths its first-parent diff changes, minus the excluded paths
export interface ReviewCommit {
  files: string[];
  sha: string;
}
