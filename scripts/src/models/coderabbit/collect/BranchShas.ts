export interface BranchShas {
  developSha: string;
  mainSha: string;
  queueSha: string;
  // The fixes branch alone may be absent: nothing has drained yet, or the last window carried what it held
  reviewFixesSha?: string;
}
