// What a drain leaves the cycle with. `isLimited` stops the run rather than failing it: no findings were
// Answered, so nothing may be ported ahead of them, and there is nothing to fix — the account is out of session.
export interface DrainFindingsResult {
  isLimited: boolean;
  // The pushed review-fixes sha, or the one the drain started from when it produced no commit
  reviewFixesSha?: string;
}
