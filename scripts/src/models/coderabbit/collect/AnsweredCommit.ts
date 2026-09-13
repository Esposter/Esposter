// A commit and the findings its trailers say it answers — the collector's memory of which reply each pushed
// Commit owes, carried by the commit itself so no run has to remember it.
export interface AnsweredCommit {
  answers: number[];
  drains: number[];
  sha: string;
  subject: string;
}
