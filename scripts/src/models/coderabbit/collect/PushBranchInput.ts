export interface PushBranchInput {
  branch: string;
  // The tree the push is made from, when the candidate was built somewhere other than the checkout
  cwd?: string;
  // The sha every count was measured against — the push is refused when the remote no longer sits on it
  expectedSha: string;
  isDryRun: boolean;
  sha: string;
}
