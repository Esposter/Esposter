// A commit as a count that must outlive its sha keys it: by the change it carries, which every rewrite of the queue
// Keeps while it gives the commit a new sha (`readCommitPatch`)
export interface CommitPatch {
  // The commit's `git patch-id --stable`
  patchId: string;
}
