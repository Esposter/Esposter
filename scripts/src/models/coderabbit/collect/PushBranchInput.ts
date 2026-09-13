export interface PushBranchInput {
  branch: string;
  // The tree the push is made from, when the candidate was built somewhere other than the checkout
  cwd?: string;
  isDryRun: boolean;
  sha: string;
}
