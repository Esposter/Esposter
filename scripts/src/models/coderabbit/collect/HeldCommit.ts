// A commit parked on its own held branch (`parkCommits`), as the last fetch saw it
export interface HeldCommit {
  branch: string;
  sha: string;
}
