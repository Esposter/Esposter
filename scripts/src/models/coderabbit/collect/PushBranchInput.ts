export interface PushBranchInput {
  branch: string;
  // The tree the push is made from, when the candidate was built somewhere other than the checkout
  cwd?: string;
  // The sha every count was measured against — the push is refused when the remote no longer sits on it
  expectedSha: string;
  isDryRun: boolean;
  // The branch is being rewritten rather than advanced — the queue after a sync — so the target is not asserted
  // To descend from the sha the lease names
  isRewrite?: true;
  sha: string;
}
