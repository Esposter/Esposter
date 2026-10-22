// Doubles from the base for each zero-based attempt and holds at the max. The one formula every retry in the repo
// Waits by, so a change to how long a retry waits is made once
export const getExponentialBackoffDelayMs = (attempt: number, baseDelayMs: number, maxDelayMs: number): number =>
  Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
