// Doubles from the base for each zero-based attempt and holds at the max. The formula the backoff helpers wait by
// (createExponentialBackoff and the Genshin start retry), so a change to their pace is made once
export const getExponentialBackoffDelayMs = (attempt: number, baseDelayMs: number, maxDelayMs: number): number =>
  Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
