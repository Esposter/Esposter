// What a drain leaves the cycle with. A session that never started stops the run rather than failing it: no
// Findings were answered, so nothing may be ported ahead of them, and there is nothing to fix.
export interface DrainFindingsResult {
  isStarted: boolean;
  // The pushed ai/review-fixes sha, or the one the drain started from when it produced no commit
  reviewFixesSha?: string;
}
