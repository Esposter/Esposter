export interface ReadinessInput {
  // Files from the frontier to the candidate head — what the review will read
  fileCount: number;
  fixCount: number;
  isForced: boolean;
  isHeld: boolean;
  // Commits already on `develop` above the frontier that no review has read. Non-zero only while no release pull
  // Request is open: with one open, the frontier is behind the head only during a review or a limit, and both
  // Are the gate's to settle rather than this rule's
  pendingCommitCount: number;
  queueCommitCount: number;
}
